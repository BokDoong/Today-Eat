import database from "../../../database";
import {StoreCardDTO} from "../dto";

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

    async getRankingSample(){
        let ranks = [];
        const keywords = ["밥약","분위기","혼밥","단체","술약속"];

        for(const keyword of keywords){
            const count = await this.getCountByKeywords(keyword);
            ranks.push(count.slice(0,5));
        }

        let result = [];
        for(let i=0;i<5;i++){
            const data = ranks[i];
            const stores = await Promise.all(
                data.map(async (id)=>{
                    const props = await this.findStoreByID(id);
                    const tags = (await this.getTagByStore(id)).slice(0,3);
                    const store = new StoreCardDTO(props,tags);
                    return store;
                })
            )
            result.push({stores:[...stores],tag:keywords[i]});
        }

        return result;
    }

    async getCountByKeywords(keyword){
        const data = await database.keyword.findMany({
            select:{
                storeId:true,
            },
            where:{
                name:keyword,
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

    async getTagByStore(id){
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
}