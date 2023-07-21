import database from "../../../database";
import {StoreCardDTO,StoreRankDTO} from "../dto";

export class StoreService{
    async findStoreByID(id){
        const store = await database.store.findFirst({
            where:{
                id:id,
            }
        });

        if(!store) throw {status:404, message:"가게를 찾을 수 없습니다."};
        return store;
    }

    //랭킹 샘플 조회
    async getRankSample(campsersId){
        const stores = await this.findStoreByCampers(campsersId);
        
        let ranks = [];
        const keywords = ["밥약","분위기","혼밥","단체","술약속"];

        for(const keyword of keywords){
            const count = await this.getKeywordCount(keyword,stores);
            ranks.push(count.slice(0,5));
        }

        let result = [];
        for(let i=0;i<5;i++){
            const data = ranks[i];
            const stores = await Promise.all(
                data.map(async (id)=>{
                    const props = await this.findStoreByID(id);
                    const tags = (await this.findTagByStore(id)).slice(0,3);
                    const store = new StoreCardDTO(props,tags);
                    return store;
                })
            )
            result.push({stores:[...stores],tag:keywords[i]});
        }

        return result;
    }
    
    //랭킹 조회
    async getRank(campsersId){
        const stores = await this.findStoreByCampers(campsersId);
        
        let ranks = [];
        const keywords = ["밥약","분위기","혼밥","단체","술약속"];

        for(const keyword of keywords){
            const count = await this.getKeywordCount(keyword,stores);
            ranks.push(count.slice(0,20));
        }

        let result = [];
        for(let i=0;i<5;i++){
            const data = ranks[i];
            const stores = await Promise.all(
                data.map(async (id)=>{
                    const props = await this.findStoreByID(id);
                    const status = await this.getStatus(id);
                    const score = await this.getAvgScore(id);
                    const reviewCount = await this.getReviewCount(id);
                    const image = await this.findReviewImages(id);
                    const reviewSample = await this.findReviewSample(id);
                    const wishlist = await this.checkWishlist(id);
                    const store = new StoreRankDTO(props,status,score,reviewCount,image,reviewSample,wishlist);
                    return store;
                })
            )
            result.push({stores:[...stores],tag:keywords[i]});
        }

        return result;
    }

    async getKeywordCount(keyword,stores){
        const data = await database.keyword.findMany({
            select:{
                storeId:true,
            },
            where:{
                name:keyword,
                storeId:{
                    in:[...stores],
                }
            },
        });
        const result = {};
        await Promise.all(
            data.map((object) => { 
                result[object.storeId] = (result[object.storeId] || 0)+1; 
            })
        )
        
        const sort = Object.fromEntries(
            Object.entries(result).sort(([,a],[,b]) => a > b? -1: 1 )
        );
        return Object.keys(sort);
    }

    async findTagByStore(id){
        const data = await database.tag.findMany({
            select:{
                name:true,
            },
            where:{
                storeId:id,
            },
        })
        const result = {};
        await Promise.all(
            data.map((object)=>{
                result[object.name] = (result[object.name] || 0)+1;
            })
        )
        const sort = Object.fromEntries(
            Object.entries(result).sort(([,a],[,b]) => a > b? -1: 1 )
        );

        return Object.keys(sort);
    }

    async findStoreByCampers(campersId){
        const data = await database.store.findMany({
            where:{
                campersId:campersId,
            }
        })
        const stores = data.map((store)=>{
            return store.id;
        })
        return stores;
    }

    async getStatus(storeId){
        const data = await database.businessHour.findFirst({
            where:{
                storeId:storeId,
            },
        });
        if(!data)return;
        console.log({storeId},{data});
        const week = [['sunOpen','sunClose'],['monOpen','monClose'],['tueOpen','tueClose'], ['wedOpen','wedClose'],
        ['thuOpen','thuClose'], ['friOpen','friClose'], ['satOpen','satClose']];
        
        const today = new Date();   
        const weekday = today.getDay();
        const open = Number(data[week[weekday][0]].replace(':',''));
        const close = Number(data[week[weekday][1]].replace(':',''));

        let preClose,preOpen;
        if(weekday===0){
            preOpen = Number(data[week[6][0]].replace(':',''));
            preClose = Number(data[week[6][1]].replace(':',''));
        }else{
            preOpen = Number(data[week[weekday-1][0]].replace(':',''));
            preClose = Number(data[week[weekday-1][1]].replace(':',''));
        }
        
        const now = Number(String(today.getHours()) + String(today.getMinutes()));

        if(open<now&&close>now){
            return true;
        }
        else if(preClose<preOpen&&preClose>now){
            return true;
        }
        else{
            return false;
        }
    }

    async getAvgScore(storeId){
        const data = await database.review.aggregate({
            where:{
                storeId:storeId,
            },
            _avg:{
                score:true,
            }
        })
        return data._avg.score;
    }

    async findReviewSample(storeId){
        const data = await database.review.findFirst({
            select:{
                content:true,
            },
            where:{
                storeId:storeId,
            },
        });
        if(!data){
            return;
        }
        return data.content;
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

    async checkWishlist(userId,storeId){
        const data = await database.wishList.findFirst({
            where:{
                storeId:storeId,
                userId:userId,
            }
        })
        if(!data)return false;
        return true;
    }
}



//new StoreService().getStatus("02de5389-807a-43fb-8716-a7126ee6ef33");
new StoreService().getReviewCount("a");