import database from "../../../database";
import {StoreCardDTO,StoreCategoryDTO,StoreDetailDTO,StoreDetailMapDTO,StoreMapDTO,StoreRankDTO, StoreRecommendDTO, StoreReviewedDTO, StoreSearchDTO, StoreWishlistDTO} from "../dto";
import {reviewService} from "../../reviews/service";
import {Prisma} from '@prisma/client';

class StoreService{

    //랭킹 갱신
    async updateRank(){
        await database.tagRank.deleteMany();
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
            const keywords = ["밥약","가성비","혼밥","단체","술약속"];

            for(const keyword of keywords){
                const count = await this.getKeywordCount(keyword,storeIds);
                ranks.push(count.slice(0,20));
            }  
            
            for(let i=0;i<5;i++){
                const data = ranks[i];
                for(let j=0;j<data.length;j++){
                    await database.tagRank.create({
                        data:{
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
        const keywords = ["밥약","가성비","혼밥","단체","술약속"];

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
        let result = {};
        for(let i=0;i<5;i++){
            const data = ranks[i];
            const stores = await Promise.all(
                data.map(async (id)=>{
                    const props = await this.findStoreByID(id);
                    let imageURL = null;
                    if(props.hasOwnProperty("imageUrl")){
                        imageURL = props.imageUrl;
                    } 
                    const tags = Object.keys((await this.findTagByStore(id))).slice(0,3);
                    const isWishlist = await this.checkWishlist(userId,id);
                    const category = await this.changeCategory(props.category);
                    const time = await this.convertDistanceToTime(props.distance);
                    const score = await this.getAvgScore(props.id);
                    const store = new StoreCardDTO({...props,imageURL,tags,isWishlist,category,time,score});
                    return store;
                })
            )
            result[keywords[i]]=stores;
        }

        return result;
    }

    //랭킹 조회
    async getRank(userId,campersId){
        let ranks = [];
        const keywords = ["밥약","가성비","혼밥","단체","술약속"];

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

        let result = {};
        for(let i=0;i<5;i++){
            const data = ranks[i];
            const stores = await Promise.all(
                data.map(async (id)=>{
                    const props = await this.findStoreByID(id);
                    let imageURL = null;
                    if(props.hasOwnProperty("imageUrl")){
                        imageURL = props.imageUrl;
                    } 
                    const score = await this.getAvgScore(id);
                    const reviewCount = await reviewService.getReviewCount(id);
                    const reviewSample = await reviewService.findReviewSample(id);
                    const reviewContent = reviewSample?reviewSample.content:null;
                    const wishlist = await this.checkWishlist(userId,id);
                    const category = await this.changeCategory(props.category);
                    const time = await this.convertDistanceToTime(props.distance);
                    const store = new StoreRankDTO({...props,imageURL,score,reviewCount,reviewContent,wishlist,category,time});
                    return store;
                })
            )
            result[keywords[i]]=stores;
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
            const score = await this.getAvgScore(store.id);
            const reviewCount = await reviewService.getReviewCount(store.id);
            const category = await this.changeCategory(store.category);
            const time = await this.convertDistanceToTime(store.distance);
            const distance = store.distance;

            return new StoreSearchDTO({...store,score,reviewCount,category,time,distance});
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
            const score = await this.getAvgScore(storeId);
            const reviewCount = await reviewService.getReviewCount(storeId);
            const reviewSample = await reviewService.findReviewSample(storeId);
            const reviewContent = reviewSample?reviewSample.content:null;
            const rank = await this.getRankByStore(storeId);
            const time = await this.convertDistanceToTime(store.distance);
            const dto = new StoreWishlistDTO({...store,score,reviewCount,reviewContent,rank,category,time});   
            storeList.push(dto);     
        }
        return storeList;
    }

    //가게 찜하기/해제
    async storeWishlist(userId,storeId,isLike){
        const check = await this.checkWishlist(userId,storeId);

        if(isLike){
            if(check)throw {status:409,message:"이미 찜한 가게입니다."}

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
        if(!check)throw {status:404,message:"찜하지 않은 가게입니다."}
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
        const categoryList = ['한식','중식','양식','일식','분식','아시아','패스트푸드','레스토랑','카페','술집'];
        let categorys = {};
        categoryList.forEach((category)=>categorys[category] = []);

        await Promise.all(stores.map(async(store)=>{
            const score = await this.getAvgScore(store.id);
            const reviewCount = await reviewService.getReviewCount(store.id);
            const reviewSample = await reviewService.findReviewSample(store.id);
            const reviewContent = reviewSample?reviewSample.content:null;
            const isWishlist = await this.checkWishlist(userId,store.id);
            const rank = await this.getRankByStore(store.id);
            const time = await this.convertDistanceToTime(store.distance);
            const category = await this.changeCategory(store.category);
            const dto = new StoreCategoryDTO({...store,category,score,reviewCount,reviewContent,isWishlist,rank,time});

            if(!category){
                return;
            }
            categorys[category].push(dto);
        }));
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
    async getStoresOnMap(user,distance,keyword,category){
        const userId = user.id;
        const campersId = user.campersId;
        const campers = await this.findCampersByID(campersId);
        const dst = distance+200;

        let input = Prisma.UserCreateInput;
        if(!distance){
            if(!keyword){
                if(!category){
                    input = {
                        campersId:campersId,
                    }
                }else{
                    input = {
                        campersId:campersId,
                        category:{
                            in:category,
                        }
                    }
                }
            }else{
                if(!category){
                    input = {
                        campersId:campersId,
                        keywords:{
                            some:{
                                name:{
                                    in:keyword,
                                }
                            }
                        },
                    }
                }else{
                    input = {
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
                }
            }
        }else{
            if(!keyword){
                if(!category){
                    input = {
                        campersId:campersId,
                        distance:{
                            lte:dst,
                        },
                    }
                }else{
                    input = {
                        campersId:campersId,
                        distance:{
                            lte:dst,
                        },
                        category:{
                            in:category,
                        }
                    }
                }
            }else{
                if(!category){
                    input = {
                        campersId:campersId,
                        keywords:{
                            some:{
                                name:{
                                    in:keyword,
                                }
                            }
                        },
                    }
                }else{
                    input = {
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
                }
            }
        }

        let stores
        stores = await database.store.findMany({
            select:{
                id:true,
                x:true,
                y:true,
            },
            where:input,
        })
       
        let details = [];
        await Promise.all(stores.map(async (store)=>{
            const isWishlist = await this.checkWishlist(userId,store.id); 
            details.push(new StoreMapDTO({...store, isWishlist}));
        }))

        return {campers:{x:campers.x,y:campers.y},stores:details};
    }

    //지도 페이지 가게 정보
    async getStoreOnMap(userId,storeId){
        const store = await this.findStoreByID(storeId);
        const category = await this.changeCategory(store.category);
        const score = await this.getAvgScore(storeId);
        const reviewCount = await reviewService.getReviewCount(storeId);
        const reviewSample = await reviewService.findReviewSample(storeId);
        const reviewContent = reviewSample?reviewSample.content:null;
        const reviewImage = reviewSample?reviewSample.reviewImages[0]:null;
        const rank = await this.getRankByStore(storeId);
        const time = await this.convertDistanceToTime(store.distance);
        const isWishlist = await this.checkWishlist(userId,store.id);
        const dto = new StoreDetailMapDTO({...store,score,reviewCount,reviewContent,reviewImage,rank,category,time,isWishlist});   
        return dto;
    }

    //가게 추천
    async recommendStore(campersId){
        const storeCount = await database.store.count({
            where:{
                campersId:campersId,
            }
        });
        let stores = new Array();
        let storeIds = new Set();
        if(storeCount<=5){
            stores = await database.store.findMany({
                where:{
                    campersId:campersId,
                }
            });
        }else{
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
        }
        
        const details = await Promise.all(stores.map(async(store)=>{
            const score = await this.getAvgScore(store.id);
            const reviewCount = await reviewService.getReviewCount(store.id);
            const category = await this.changeCategory(store.category);
            const time = await this.convertDistanceToTime(store.distance);

            return new StoreRecommendDTO({...store,score,reviewCount,category,time});
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
            const score = await this.getAvgScore(storeId);
            const reviewCount = await reviewService.getReviewCount(storeId);
            const reviewSample = await reviewService.findReviewSample(storeId);
            const reviewContent = reviewSample?reviewSample.content:null;
            const rank = await this.getRankByStore(storeId);    
            const isWishlist = await this.checkWishlist(userId,storeId);
            const category = await this.changeCategory(store.category);
            const time = await this.convertDistanceToTime(store.distance);

            return new StoreReviewedDTO({...store,score,reviewCount,reviewContent,rank,isWishlist,category,time})
        }))

        return details;
    }
    
    //가게 상세페이지
    async getStoreDetail(userId,storeId){
        const store = await this.findStoreByID(storeId);
        const x = store.x;
        const y = store.y;
        const category = await this.changeCategory(store.category);
        const time = await this.convertDistanceToTime(store.distance);
        const keywords = await this.getRankByStore(storeId);
        const tags = await this.findTagByStore(storeId);
        const imageCount = (await reviewService.getReviewImagesByStore(storeId)).count;
        const reviewCount = await reviewService.getReviewCount(storeId);
        const isWishlist = await this.checkWishlist(userId,store.id);


        return new StoreDetailDTO({...store,keywords,tags,category,time,imageCount,x,y,reviewCount,isWishlist});
    }


    /*-----------------------------------------------------------------------------------------------------*/
    /*-----------------------------------------------------------------------------------------------------*/

    async findCampersByID(campersId){
        const campers = await database.campers.findUnique({
            where:{
                id:campersId,
            }
        });
        return campers;
    }

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

    async getAvgScore(storeId){
        const data = await database.review.aggregate({
            where:{
                storeId:storeId,
            },
            _avg:{
                score:true,
            }
        })
        if(!data._avg.score)return 0;
        return Number(data._avg.score.toFixed(1));
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
            },
            orderBy:{
                rank:"asc",
            }
        });
        return rank;
    }

    async changeCategory(category){
        if(category=="한식"||category=="기사식당"||category=="샤브샤브"||category=="야식"){
            return '한식';
        }else if(category=="중식"){
            return '중식';
        }else if(category=="양식"){
            return '양식';
        }else if(category=="일식"||category=="퓨전요리"){
            return '일식';
        }else if(category=="분식"){
            return '분식';
        }else if(category=="아시아음식"||category=="철판요리"){
            return '아시아';
        }else if(category=="패스트푸드"||category=="치킨"||category=="도시락"){
            return '패스트푸드';
        }else if(category=="뷔페"||category=="패밀리레스토랑"){
            return '레스토랑';
        }else if(category=="카페"||category=="간식"||category=="샐러드"){
            return '카페';
        }else if(category=="술집"){
            return '술집';
        }else{
            return null;
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