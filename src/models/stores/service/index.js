import database from "../../../database";

export class StoreService{
    async findStoreByID(id){
        const store = await database.store.findFirst({
            where:{
                id,
            }
        });

        if(!store) throw {status:404, message:"가게를 찾을 수 없습니다."};
        return store;
    }
}