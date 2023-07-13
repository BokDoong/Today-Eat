import { Router } from "express";
import { StoreService } from "../service";

class StoreController{
    router;
    path = "/stores";
    storeService;

    constructor(){
        this.router = new Router();
        this.storeService = new StoreService();
        this.init();
    }

    init(){
        this.router.get("/:id",this.getDetail.bind(this));  
    }

    async getDetail(req,res,next){
        try{
            const {id} = req.params

            const detail = await this.storeService.getDetail(id);

            res.status(200).json({detail});
        }catch(err){
            next(err);
        }
    }
}