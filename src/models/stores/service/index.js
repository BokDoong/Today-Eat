import database from "../../../database";
import {StoreCardDTO,StoreCategoryDTO,StoreDetailDTO,StoreDetailMapDTO,StoreMapDTO,StoreRankDTO, StoreRecommendDTO, StoreReviewedDTO, StoreSearchDTO, StoreWishlistDTO} from "../dto";
import {reviewService} from "../../reviews/service";

class StoreService{

    //랭킹 갱신
    async updateRank(){
        let first = true;
        const check = await database.tagRank.findFirst();
        if(check){
            first = false;
        }
        let campersList = await database.campers.findMany({
            select:{
                id:true,
            }
        });
        for(const campers of campersList){
            const stores = await this.findStoreByCampers(campers.id);
            const storeIds = stores.map((store)=>{
                return store.id;
            })
            let ranks = [];
            const keywords = ["밥약","분위기","혼밥","단체","술약속"];

            for(const keyword of keywords){
                const count = await this.getKeywordCount(keyword,storeIds);
                ranks.push(count.slice(0,20));
            }  
            
            for(let i=0;i<5;i++){
                const data = ranks[i];
                for(let j=0;j<data.length;j++){
                    await database.tagRank.upsert({
                        where:{
                            tag_rank_campersId:{
                                tag:keywords[i],
                                rank:j+1,
                                campersId:campers.id,
                            },
                        },
                        update:{
                            campers:{
                                connect:{
                                    id:campers.id,
                                }                                    
                            },
                            store:{
                                connect:{
                                    id:data[j],
                                },
                            },
                            rank:j+1,
                            tag:keywords[i],
                        },
                        create:{
                            campers:{
                                connect:{
                                    id:campers.id,
                                }                                    
                            },
                            store:{
                                connect:{
                                    id:data[j],
                                },
                            },
                            rank:j+1,
                            tag:keywords[i],
                        }
                    })
                }
            }
        }
    }

    //랭킹 샘플 조회
    async getRankSample(user){        
        const userId = user.id;
        const campersId = user.campersId;
        let ranks = [];
        const keywords = ["밥약","분위기","혼밥","단체","술약속"];

        for(const keyword of keywords){
            const rank = await database.tagRank.findMany({
                where:{
                    tag:keyword,
                    campersId:campersId,
                },
                orderBy:{
                    rank:"asc",
                },
                take:5,
            })
            const storeIds = rank.map((store)=>store.storeId);
            ranks.push(storeIds);
        }
        let result = [];
        for(let i=0;i<5;i++){
            const data = ranks[i];
            const stores = await Promise.all(
                data.map(async (id)=>{
                    const props = await this.findStoreByID(id);
                    const tags = Object.keys((await this.findTagByStore(id))).slice(0,3);
                    const isWishlist = await this.checkWishlist(userId,id);
                    const category = await this.changeCategory(props.category);
                    const time = await this.convertDistanceToTime(props.distance);
                    const store = new StoreCardDTO({...props,tags,isWishlist,category,time});
                    return store;
                })
            )
            result.push({stores:[...stores],tag:keywords[i]});
        }

        return result;
    }

    //랭킹 조회
    async getRank(userId,campersId){
        let ranks = [];
        const keywords = ["밥약","분위기","혼밥","단체","술약속"];

        for(const keyword of keywords){
            const rank = await database.tagRank.findMany({
                where:{
                    tag:keyword,
                    campersId:campersId,
                },
                orderBy:{
                    rank:"asc",
                },
                take:20,
            })
            const storeIds = rank.map((store)=>store.storeId);
            ranks.push(storeIds);
        }

        let result = [];
        for(let i=0;i<5;i++){
            const data = ranks[i];
            const stores = await Promise.all(
                data.map(async (id)=>{
                    const props = await this.findStoreByID(id);
                    const status = await this.getStatus(id);
                    const score = await this.getAvgScore(id);
                    const reviewCount = await reviewService.getReviewCount(id);
                    const reviewSample = await reviewService.findReviewSample(id);
                    const wishlist = await this.checkWishlist(userId,id);
                    const category = await this.changeCategory(props.category);
                    const time = await this.convertDistanceToTime(props.distance);
                    const store = new StoreRankDTO({...props,status,score,reviewCount,reviewSample:reviewSample.content,wishlist,category,time});
                    return store;
                })
            )
            result.push({stores:[...stores],tag:keywords[i]});
        }

        return result;
    }

    //가게 검색
    async searchStore(campersId,word,orderby){
        const stores = await database.store.findMany({
            where:{
                name:{
                    contains:word,
                },
                campersId:campersId,
            }
        })
        let result = await Promise.all(stores.map(async(store)=>{
            const status = await this.getStatus(store.id);
            const score = await this.getAvgScore(store.id);
            const reviewCount = await reviewService.getReviewCount(store.id);
            const category = await this.changeCategory(store.category);
            const time = await this.convertDistanceToTime(store.distance);

            return new StoreSearchDTO({...store,status,score,reviewCount,category,time});
        }))

        result = result.sort((a,b)=>{
            if(orderby==="distance"){
                return a.distance - b.distance;
            }else if(orderby==="score"){
                return b.score - a.score;
            }else if(orderby==="reviewCount"){
                return b.reviewCount - a.reviewCount;
            }
        })

        return result;
    }

    //찜 목록 조회
    async getWishlist(userId){
        const wishlists = await database.wishList.findMany({
            where:{
                userId:userId,
            }
        });
        let storeList = [];
        for(const wishlist of wishlists){
            const storeId = wishlist.storeId;

            const store = await this.findStoreByID(storeId);
            const category = await this.changeCategory(store.category);
            const status = await this.getStatus(storeId);
            const score = await this.getAvgScore(storeId);
            const reviewCount = await reviewService.getReviewCount(storeId);
            const reviewSample = await reviewService.findReviewSample(storeId);
            const rank = await this.getRankByStore(storeId);
            const time = await this.convertDistanceToTime(store.distance);
            const dto = new StoreWishlistDTO({...store,status,score,reviewCount,reviewSample:reviewSample.content,rank,category,time});   
            storeList.push(dto);     
        }
        return storeList;
    }

    //가게 찜하기/해제
    async storeWishlist(userId,storeId,isLike){
        if(isLike){
            const data = await database.wishList.create({
                data:{
                    store:{
                        connect:{
                            id:storeId,
                        },
                    },
                    user:{
                        connect:{
                            id:userId,
                        },
                    },
                }
            })
            return data;
        }
        const data = await database.wishList.delete({
            where:{
                userId_storeId:{
                    storeId:storeId,
                    userId:userId,
                }
            }
        })
        return data;
    }

    //카테고리별 조회
    async getStoreByCategory(user,orderby){
        const userId= user.id;
        const campersId = user.campersId;
        const stores = await this.findStoreByCampers(campersId);
        const categorys = {'한식':[],'중식':[],'양식':[],'일식':[],'분식':[],'아시아':[],'패스트푸드':[],'레스토랑':[],'카페/디저트':[],'술':[]};

        for(const store of stores){
            const status = await this.getStatus(store.id);
            const score = await this.getAvgScore(store.id);
            const reviewCount = await reviewService.getReviewCount(store.id);
            const reviewSample = await reviewService.findReviewSample(store.id);
            const isWishlist = await this.checkWishlist(store.id);
            const rank = await this.getRankByStore(store.id);
            const time = await this.convertDistanceToTime(store.distance);
            const dto = new StoreCategoryDTO({...store,status,score,reviewCount,reviewSample:reviewSample.content,isWishlist,rank,time});
            
            categorys[await this.changeCategory(store.category)].push(dto);
        }
        for(let category in categorys){
            categorys[category] = categorys[category].sort((a,b)=>{
                if(orderby==="distance"){
                    return a.distance - b.distance;
                }else if(orderby==="score"){
                    return b.score - a.score;
                }else if(orderby==="reviewCount"){
                    return b.reviewCount - a.reviewCount;
                }
            })
        }
        return categorys;         
    }

    //지도 페이지 가게 목록
    async getStoresOnMap(user,distance,keyword,category,isOpen){
        const userId = user.id;
        const campersId = user.campersId;
        const dst = distance+200;

        let stores
        if(!distance){
            stores = await database.store.findMany({
                select:{
                    id:true,
                    x:true,
                    y:true,
                },
                where:{
                    campersId:campersId,
                    keywords:{
                        some:{
                            name:{
                                in:keyword,
                            }
                        }
                    },
                    category:{
                        in:category,
                    }
                }
            })
        }else{
            stores = await database.store.findMany({
                select:{
                    id:true,
                    x:true,
                    y:true,
                },
                where:{
                    campersId:campersId,
                    distance:{
                        lte:dst,
                    },
                    keywords:{
                        some:{
                            name:{
                                in:keyword,
                            }
                        }
                    },
                    category:{
                        in:category,
                    }
                }
            })
        }
        let details = [];
        await Promise.all(stores.map(async (store)=>{
            const isWishlist = await this.checkWishlist(userId,store.id);

            if(isOpen){
                const status = await this.getStatus(store.id);
                if(!status){
                    return;
                }
            }    
            details.push(new StoreMapDTO({...store, isWishlist}));
        }))

        return details;
    }

    //지도 페이지 가게 정보
    async getStoreOnMap(storeId){
        const store = await this.findStoreByID(storeId);
        const category = await this.changeCategory(store.category);
        const status = await this.getStatus(storeId);
        const score = await this.getAvgScore(storeId);
        const reviewCount = await reviewService.getReviewCount(storeId);
        const reviewSample = await reviewService.findReviewSample(storeId);
        const rank = await this.getRankByStore(storeId);
        const time = await this.convertDistanceToTime(store.distance);
        const dto = new StoreDetailMapDTO({...store,status,score,reviewCount,reviewSample:reviewSample.content,reviewImage:reviewSample.reviewImages[0],rank,category,time});   
        return dto;
    }

    //가게 추천
    async recommendStore(campersId){
        const storeCount = await database.store.count();
        let stores = new Array();
        let storeIds = new Set();
        while(stores.length<5){
            const random = Math.floor(Math.random() * storeCount);
            const store = await database.store.findFirst({
                where:{
                    campersId:campersId,
                },
                skip:random
            });
            if(storeIds.has(store.id))continue;
            stores.push(store);
            storeIds.add(store.id);
        }

        const details = await Promise.all(stores.map(async(store)=>{
            const status = await this.getStatus(store.id);
            const score = await this.getAvgScore(store.id);
            const reviewCount = await reviewService.getReviewCount(store.id);
            const category = await this.changeCategory(store.category);
            const time = await this.convertDistanceToTime(store.distance);

            return new StoreRecommendDTO({...store,status,score,reviewCount,category,time});
        })) 

        return details;
    }

    //리뷰 작성한 가게 목록
    async getReviewedStore(userId){
        const reviews = (await reviewService.findReviewByUser(userId));
        let storeIds = reviews.map((review)=>{
            return review.storeId;
        })
        storeIds = new Set(storeIds);
        storeIds = [...storeIds].slice(0,5);

        const details = await Promise.all(storeIds.map(async(storeId)=>{
            const store = await this.findStoreByID(storeId);
            const status = await this.getStatus(storeId);
            const score = await this.getAvgScore(storeId);
            const reviewCount = await reviewService.getReviewCount(storeId);
            const reviewSample = await reviewService.findReviewSample(storeId);
            const rank = await this.getRankByStore(storeId);    
            const isWishlist = await this.checkWishlist(userId,storeId);
            const category = await this.changeCategory(store.category);
            const time = await this.convertDistanceToTime(store.distance);

            return new StoreReviewedDTO({...store,status,score,reviewCount,reviewSample:reviewSample.content,rank,isWishlist,category,time})
        }))

        return details;
    }
    
    //가게 상세페이지
    async getStoreDetail(storeId){
        const store = await this.findStoreByID(storeId);
        const category = await this.changeCategory(store.category);
        const status = await this.getStatus(storeId);
        const distance = await this.convertDistanceToTime(props.distance);

        const days = ['sunClose','monClose','tueClose','wedClose','thuClose','friClose','satClose'];
        const today = days[new Date().getDay()];
        let closeTime
        const time = await this.getBussinessHourByStore(storeId);
        if(time)closeTime = time[today];
        const keywords = await this.getRankByStore(storeId);
        const tags = await this.findTagByStore(storeId);

        return new StoreDetailDTO({...store,status,closeTime,keywords,tags,category,distance});
    }


    /*-----------------------------------------------------------------------------------------------------*/
    /*-----------------------------------------------------------------------------------------------------*/


    async convertDistanceToTime(distance){
        const dst = distance - 200;
        if(dst<=100){
            return "2분";
        }else if(dst<=300){
            return "5분";
        }else if(dst<=500){
            return "7분";
        }else if(dst<=700){
            return "10분";
        }else{
            return "10분+";
        }
    }

    async getBussinessHourByStore(storeId){
        const time = await database.businessHour.findUnique({
            where:{
                storeId:storeId,
            }
        });
        return time;
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

        return sort;
    }

    async findStoreByCampers(campersId){
        const data = await database.store.findMany({
            where:{
                campersId:campersId,
            },
        })
        return data;
    }

    async getStatus(storeId){
        const data = await database.businessHour.findFirst({
            where:{
                storeId:storeId,
            },
        });
        if(!data)return;
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

    async getRankByStore(storeId){
        const rank = await database.tagRank.findMany({
            select:{
                tag:true,
                rank:true,
            },
            where:{
                storeId:storeId,
            }
        });
        return rank;
    }

    async changeCategory(category){
        if(category=="한식"||category=="기사식당"||category=="샤브샤브"||category=="야식"){
            return '한식';
        }else if(category=="중식"){
            return '중식';
        }else if(category=="양식"||category=="패밀리레스토랑"){
            return '양식';
        }else if(category=="일식"||category=="퓨전요리"){
            return '일식';
        }else if(category=="분식"){
            return '분식';
        }else if(category=="아시아음식"||category=="철판요리"){
            return '아시아';
        }else if(category=="패스트푸드"||category=="치킨"||category=="도시락"){
            return '패스트푸드';
        }else if(category=="뷔페"||category=="푸트코트"){
            return '종합식당';
        }else if(category=="카페"||category=="간식"||category=="샐러드"){
            return '카페/디저트';
        }else if(category=="술집"){
            return '술집';
        }
    }

    async findStoreByID(id){
        const store = await database.store.findFirst({
            where:{
                id:id,
            }
        });

        if(!store) throw {status:404, message:"가게를 찾을 수 없습니다."};
        return store;
    }
}

export const storeService = new StoreService();