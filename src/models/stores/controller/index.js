import { Router } from "express";
import { StoreService } from "../service";
import { UserService } from "../../users/service";
import {storeData, campersData} from "../../../utils";

class StoreController{
    router;
    path = "/api/v1/stores";
    storeService;

    constructor(){
        this.router = new Router();
        this.storeService = new StoreService();
        this.userService = new UserService();
        this.init();
    }

    init(){
        this.router.get("/fetch-campers-data",campersData.bind(this));
        this.router.get("/fetch-store-data",storeData.bind(this));
        this.router.get("/rank-sample",this.getRankSample.bind(this));
        this.router.get("/rank",this.getRank.bind(this));
    }


    //랭킹 샘플 조회
    getRankSample = async (req,res,next) => {
        try{
            const user = await this.userService.findUserById(req.user.id);
            const result = await this.storeService.getRankSample(user.campersId);
            
            res.status(200).json(result);
        }catch(err){
            next(err);
        }
    }

    getRank = async (req,res,next) => {
        try{
            const user = await this.userService.findUserById(req.user.id);
            const result = await this.storeService.getRank(user.campersId);
            
            res.status(200).json(result);
        }catch(err){
            next(err);
        }
    }
}

const storeController = new StoreController();
export default storeController;