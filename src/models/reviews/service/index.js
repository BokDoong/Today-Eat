import {UserService} from "../../users/service";
import {storeService} from "../../stores/service";
import database from "../../../database";
import { MyReviewDTO, ReviewDTO } from "../dto";

class ReviewService{
    userService;
    constructor(){
        this.userService = new UserService();
    }

    //리뷰 작성
    createReview = async (userId,props) => {
        const newReview = await database.review.create({
            data:{
                content:props.content,
                score:props.score,
                user:{
                    connect:{
                        id:userId,
                    }
                },
                store:{
                    connect:{
                        id:props.storeId,
                    },
                },
                keywords:{
                    createMany:{
                        data:props.keywords.map((keyword)=>({
                            name:keyword,
                            storeId:props.storeId
                        })),
                    }
                },
                tags:{
                    createMany:{
                        data:props.tags.map((tag)=>({
                            name:tag,
                            storeId:props.storeId,
                        })),
                    }
                },
                reviewImages:{
                    createMany:{
                        data:props.images.map((image)=>({imageUrl:image}))
                    }
                }
            }
        })

        const store = await storeService.findStoreByID(props.storeId);
        if(!store.imageUrl){
            await database.store.update({
                where:{
                    id:store.id,
                },
                data:{
                    imageUrl:props.images[0],
                }
            })
        }

        return newReview.id;
    }

    //리뷰 수정
    updateReview = async (userId, reviewId, props) => {
        const oldReview = await this.findReviewById(reviewId);
        if(oldReview.userId!==userId) throw{status:403,message:"권한이 없습니다"};

        const newReview = await database.review.update({
            where:{
                id:reviewId,
            },
            data:{
                content:props.content,
                score:props.score,
                keywords:{
                    createMany:{
                        data:props.keywords.map((keyword)=>({
                            name:keyword,
                            storeId:oldReview.storeId,
                        })),
                    }
                },
                tags:{
                    createMany:{
                        data:props.tags.map((tag)=>({
                            name:tag,
                            storeId:oldReview.storeId,
                        })),
                    }
                },
                reviewImages:{
                    createMany:{
                        data:props.images.map((image)=>({imageUrl:image}))
                    }
                }
            }
        })

        const store = await storeService.findStoreByID(oldReview.storeId);

        const newImages = await this.findReviewImages(store.id);
        if(newImages.imageCount!==0){
            const newImage = newImages.imageURLs[0];
            await database.store.update({
                where:{
                    id:store.id
                },
                data:{
                    imageUrl:newImage
                }
            })
        }else{
            await database.store.update({
                where:{
                    id:store.id
                },
                data:{
                    imageUrl:null,
                }
            })
        }

        return newReview.id;
    }

    //리뷰 삭제
    async deleteReview(userId,reviewId){
        const review = await database.review.findUnique({
            where:{
                id:reviewId,
            }
        });

        if(!review) throw{status:404,message:"리뷰를 찾을 수 없습니다."};
        if(review.userId!==userId) throw{status:403,message:"권한이 없습니다."};

        
        await database.review.delete({
            where:{
                id:review.id
            },
            include:{
                reviewImages:true,
                reviewLikes:true,
            }
        })

        const store = await storeService.findStoreByID(review.storeId);
        const newImages = await this.findReviewImages(store.id);
        
        if(newImages.imageCount!==0){
            const newImage = newImages.imageURLs[0];
            await database.store.update({
                where:{
                    id:store.id
                },
                data:{
                    imageUrl:newImage
                }
            })
        }else{
            await database.store.update({
                where:{
                    id:store.id
                },
                data:{
                    imageUrl:null,
                }
            })
        }
    }

    //리뷰 좋아요
    async reviewLike(userId,reviewId,isLike){
        if(isLike){
            await database.reviewLike.create({
                data:{
                    review:{
                        connect:{
                            id:reviewId,
                        },
                    },
                    user:{
                        connect:{
                            id:userId,
                        },
                    },
                }
            })
        }else{
            await database.reviewLike.delete({
                where:{
                    userId_reviewId:{
                        userId:userId,
                        reviewId,reviewId,
                    }
                }
            })
        }
    }

    //내가 쓴 리뷰
    async getMyReview(userId){
        const reviews = await this.findReviewByUser(userId);
        const details = await Promise.all(reviews.map(async(review)=>{
            let tags = await this.findTagByReview(review.id);
            tags = await Promise.all(tags.map((tag)=>{
                return tag.name;
            }));
            const likeCount = (await this.findLikeByReview(review.id)).length;
            const createdDate = await this.getCreatedDate(review.createdAt);
            const userName = (await this.userService.findUserById(userId)).name;
            let reviewImages = await this.findReviewImagesByReviewId(review.id);
            reviewImages = reviewImages.map((image)=>image.imageUrl);
            return new MyReviewDTO({...review,tags,likeCount,createdDate,userName,reviewImages});
        }))

        return details;
    }


    //가게별 리뷰 조회
    async getReviewsByStore(storeId,orderby,skip,take){
        let reviews;
        if(orderby==="liked"){
            reviews = await database.review.findMany({
                skip:skip,
                take:take,
                where:{
                    storeId:storeId,
                },
                include:{
                    reviewImages:{
                        select:{
                            imageUrl:true
                        }
                    },
                    tags:{
                        select:{
                            name:true,
                        }
                    },
                    _count:{
                        select:{
                            reviewLikes:true,
                        }
                    }
                },
                orderBy:{
                    reviewLikes:{
                        _count:"desc",
                    }
                }
            });
        }else if(orderby==="latest"){
            reviews = await database.review.findMany({
                skip:skip,
                take:take,
                where:{
                    storeId:storeId,
                },
                include:{
                    reviewImages:{
                        select:{
                            imageUrl:true
                        }
                    },
                    tags:{
                        select:{
                            name:true,
                        }
                    },
                    _count:{
                        select:{
                            reviewLikes:true,
                        }
                    }
                },
                orderBy:{
                    createdAt:"desc",
                }
            });
        }
        
        let details = [];
        for(const review of reviews){
            const userName = (await this.userService.findUserById(review.userId)).name;
            const createdDate = await this.getCreatedDate(review.createdAt);
            details.push(new ReviewDTO({...review,userName,createdDate}));
            
        }

        return details;
        
    }


    /*-----------------------------------------------------------------------------------------------------*/
    /*-----------------------------------------------------------------------------------------------------*/


    async findReviewById(reviewId){
        const review = await database.review.findUnique({
            where:{
                id:reviewId,
            }
        })
        return review;
    }

    async findReviewSample(storeId){
        const data = await database.review.findFirst({
            include:{
                reviewImages:true,
            },
            where:{
                storeId:storeId,
            },
            orderBy:{
                reviewLikes:{
                    _count:"desc"
                }
            }
        });
        if(!data){
            return;
        }
        return data;
    }

    async findReviewImages(storeId){
        const data = await database.review.findMany({
            where:{
                storeId:storeId,
            }
        });
        const reviews = data.map((review)=>{
            return review.id;
        })
        let images = await database.reviewImage.findMany({
            select:{
                imageUrl:true,
            },
            where:{
                reviewId:{
                    in:[...reviews],
                }
            },
            take:4,
        })
        images = images.map((image)=>{
            return image.imageUrl;
        })
        const count = await database.reviewImage.aggregate({
            where:{
                reviewId:{
                    in:[...reviews],
                }
            },
            _count:{
                _all:true,
            }
        })

        return {imageURLs:images,imageCount:count._count._all};
    }

    async getReviewCount(storeId){
        const data = await database.review.aggregate({
            where:{
                storeId:storeId,
            },
            _count:{
                _all:true,
            }
        })
        return data._count._all;
    }

    async findReviewByUser(userId){
        const reviews = await database.review.findMany({
            where:{
                userId:userId,
            },
            orderBy:{
                createdAt:"desc"
            }
        });

        return reviews;
    }

    async findTagByReview(reviewId){
        const tags = await database.tag.findMany({
            where:{
                reviewId:reviewId,
            }
        });
        return tags;
    }

    async findLikeByReview(reviewId){
        const likes = await database.reviewLike.findMany({
            where:{
                reviewId:reviewId,
            }
        })

        return likes;
    }


    async getCreatedDate(createdAt){
        const days = ['일','월','화','수','목','금','토'];
        const day = (createdAt.getMonth()+1)+"."+(createdAt.getDate())+"."+days[createdAt.getDay()];
        return day;
    }

    async findReviewImagesByReviewId(reviewId){
        const reviews = await database.reviewImage.findMany({
            where:{
                reviewId:reviewId,
            }
        })
        return reviews;
    }
}

export const reviewService = new ReviewService();