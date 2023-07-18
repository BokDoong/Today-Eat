import { Router } from "express";
import { StoreService } from "../service";
import {storeData, campersData} from "../../../utils";

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
        this.router.get("/fetch-campers-data",campersData.bind(this));
        this.router.get("/fetch-store-data",storeData.bind(this));
    }

}

const storeController = new StoreController();
export default storeController;