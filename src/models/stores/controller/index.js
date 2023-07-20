import { Router } from "express";
import { StoreService } from "../service";
import {storeData, campersData} from "../../../utils";

class StoreController{
    router;
    path = "/api/v1/stores";
    storeService;

    constructor(){
        this.router = new Router();
        this.storeService = new StoreService();
        this.init();
    }

    init(){
        this.router.get("/fetch-campers-data",campersData.bind(this));
        this.router.get("/fetch-store-data",storeData.bind(this));
        this.router.get("/rank-sample",this.getRankSample.bind(this));
    }


    //랭킹 샘플 조회
    getRankingSample = async (req,res,next) => {
        try{
            const result = await this.storeService.getCards();

            res.status(200).json(result);
        }catch(err){
            next(err);
        }
    }
}

const storeController = new StoreController();
export default storeController;