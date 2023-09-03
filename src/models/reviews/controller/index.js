import { Router } from "express";
import { reviewService } from "../service";
import { CreateReviewDTO, UpdateReviewDTO } from "../dto";
import {imageUploader} from "../../../middleware";
import {pagination} from "../../../middleware"

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
        this.router.post("/like/:id",this.reviewLike.bind(this));

        this.router.get("/myReview",this.getMyReview.bind(this));

        this.router.get("/:id",pagination,this.getReviewsByStore.bind(this));
        this.router.post("/",imageUploader.array('images'),this.createReview.bind(this));
        this.router.put("/:id",imageUploader.array('images'),this.updateReview.bind(this));
        this.router.delete("/:id",this.deleteReview.bind(this));

        this.router.get("/images/:id",this.getReviewImagesByStore.bind(this));
    }
    
    //리뷰 작성
    createReview = async (req,res,next) => {
        try{
            if (!req.user) throw { status: 401, message: "로그인을 진행해주세요." };

            const filePaths = req.files.map(file => process.env.AWS_S3_BUCKET + ".s3." + process.env.AWS_S3_REGION + ".amazonaws.com/" + file.key);
            const body = JSON.parse(req.body['dto']);

            if(!body.storeId||!body.score||!body.tags||!body.keywords)throw{status:400,message:"데이터를 입력해주세요."};

            const newReviewId = await this.reviewService.createReview(
                req.user.id,
                new CreateReviewDTO({
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
            if (!req.user) throw { status: 401, message: "로그인을 진행해주세요." };

            const filePaths = req.files.map(file => process.env.AWS_S3_BUCKET + ".s3." + process.env.AWS_S3_REGION + ".amazonaws.com/" + file.key);
            const body = JSON.parse(req.body['dto']);
            const reviewId = req.params.id;

            if(!body.score||!body.tags||!body.keywords)throw{status:400,message:"데이터를 입력해주세요."};

            const newReviewId = await this.reviewService.updateReview(
                req.user.id,
                reviewId,
                new UpdateReviewDTO({
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
            if (!req.user) throw { status: 401, message: "로그인을 진행해주세요." };

            const reviewId = req.params.id;
            await this.reviewService.deleteReview(req.user.id,reviewId);

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

    //내가 쓴 리뷰 조회
    getMyReview = async (req,res,next) => {
        try{
            if (!req.user) throw { status: 401, message: "로그인을 진행해주세요." };

            const reviews = await this.reviewService.getMyReview(req.user.id);

            res.status(200).json(reviews);
        }catch(err){
            next(err);
        }
    }

    //가게별 리뷰조회
    getReviewsByStore = async (req,res,next) => {
        try{
            if (!req.user) throw { status: 401, message: "로그인을 진행해주세요." };

            const {orderby} = req.query;
            const storeId = req.params.id;
            const {take,skip} = req;
            const reviews = await this.reviewService.getReviewsByStore(storeId,orderby,skip,take);

            res.status(200).json(reviews);
        }catch(err){
            next(err);
        }
    }

    //가게별 리뷰 이미지 조회
    getReviewImagesByStore = async (req,res,next) => {
        try{
            if (!req.user) throw { status: 401, message: "로그인을 진행해주세요." };
            const storeId = req.params.id;
            const images = await this.reviewService.getReviewImagesByStore(storeId);
            res.status(200).json(images.URLs);
        }catch(err){
            next(err);
        }
    }
}

const reviewController = new ReviewController();
export default reviewController;