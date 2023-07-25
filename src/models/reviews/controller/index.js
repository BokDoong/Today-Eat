import { Router } from "express";
import { reviewService } from "../service";
import { CreateReviewDTO } from "../dto";
import {imageUploader} from "../../../middleware";

class ReviewController{
    router;
    path = "/api/v1/reviews";
    reviewService;

    constructor(){
        this.router = new Router();
        this.reviewService = reviewService;
        this.init();
    }

    init(){
        this.router.post("/",imageUploader.array('images'),this.createReview.bind(this));
    }
    
    //리뷰 작성
    createReview = async (req,res,next) => {
        try{
            const filePaths = req.files.map(file => process.env.AWS_S3_BUCKET + ".s3." + process.env.AWS_S3_REGION + ".amazonaws.com/" + file.key);
            const body = JSON.parse(req.body['dto']);

            const newReviewId = await this.reviewService.createReview(
                new CreateReviewDTO({
                    userId:req.user.id,
                    storeId:body.storeId,
                    content:body.content,
                    score:body.score,
                    tags:body.tags,
                    keywords:body.keywords,
                    images:filePaths,
                })
            )
            res.status(201).json({id:newReviewId});
        }
        catch(err){
            next(err);
        }
    }
}

const reviewController = new ReviewController();
export default reviewController;