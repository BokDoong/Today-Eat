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
        this.router.put("/:id",imageUploader.array('images'),this.updateReview.bind(this));
        this.router.delete("/:id",this.deleteReview.bind(this));
        
        this.router.post("/like/:id",this.reviewLike.bind(this));
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

    //리뷰 수정
    updateReview = async (req,res,next) => {
        try{
            const filePaths = req.files.map(file => process.env.AWS_S3_BUCKET + ".s3." + process.env.AWS_S3_REGION + ".amazonaws.com/" + file.key);
            const body = JSON.parse(req.body['dto']);
            const reviewId = req.params.id;

            const newReviewId = await this.reviewService.updateReview(
                reviewId,
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
        }catch(err){
            next(err);
        }
    }

    //리뷰 삭제
    deleteReview = async (req,res,next) => {
        try{
            const reviewId = req.params.id;
            await this.reviewService.deleteReview(reviewId);

            res.status(200).json();
        }catch(err){
            next(err);
        }
    }


    //리뷰 좋아요
    reviewLike = async (req,res,next) => {
        try{
            if (!req.user) throw { status: 401, message: "로그인을 진행해주세요." };
            const userId = req.user.id;
            const reviewId = req.params.id;
            const { isLike } = req.body;

            await this.reviewService.reviewLike(userId,reviewId,isLike);

            res.status(204).json();
        }catch(err){
            next(err);
        }
    }
}

const reviewController = new ReviewController();
export default reviewController;