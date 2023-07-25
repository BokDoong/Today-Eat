import { Router, response } from "express";
import { AuthService } from "../service";
import { LoginDTO, RegisterDTO } from "../dto";
import { redisClient } from "../../../utils"
import { UserService } from "../../users/service";
import { imageUploader } from "../../../middleware"


class AuthController {
    authService;
    router;
    path = "/api/v1/auth";

    constructor() {
        this.router = Router();
        this.authService = new AuthService();
        this.UserService = new UserService();
        this.init();
    }

    init() {
        this.router.post("/register", imageUploader.single('image'), this.register.bind(this));
        this.router.post("/login", this.login.bind(this));
        this.router.post("/refresh",this.refresh.bind(this));
        this.router.post("/email",this.emailSend.bind(this));
        this.router.post("/email-auth", this.emailAuth.bind(this));
    }

    async register(req, res, next) {
        try{
            // const body = req.body;
            if (!req.file) throw { status: 401, message: "file이 없습니다." };

            const filePath = process.env.AWS_S3_BUCKET + ".s3." + process.env.AWS_S3_REGION + ".amazonaws.com/" + req.file.key;
            const body = JSON.parse(req.body['dto']);

            const { accessToken, refreshToken } = await this.authService.register(
                new RegisterDTO({
                    email: body.email,
                    name: body.name,
                    university_email: body.university_email,
                    nickname: body.nickname,
                    classOf: body.classOf,
                    phoneNumber: body.phoneNumber,
                    imageURL: filePath,
                    campersId: body.campersId,
                    password: body.password,
                })
            );

        res.status(200).json({
            accessToken,
            refreshToken,
          });
        } catch (err) {
          next(err);
        }
    }

    async login(req, res, next) {
        try{
            const body = req.body;

            const { accessToken, refreshToken } = await this.authService.login(
                new LoginDTO(body)
            );

            res.status(200).json({
                accessToken,
                refreshToken,
              });

        } catch (err) {
            next(err);
        }
    }

    async refresh(req, res, next){
        try{
            const body = req.body;

            const { accessToken, refreshToken } = await this.authService.refresh(
                body.accessToken,
                body.refreshToken,
            );

            res.status(200).json({
                accessToken,
                refreshToken,
            });
        } catch (err) {
            next(err);
        }
    }
    
    async emailSend(req, res, next){
        try{
            const authNum = await this.authService.generateRandomNum();
            const { university_email } = req.body;

            await this.authService.sendMail(university_email, authNum);
            console.log(authNum);
            res.status(200).json({message: "메일 전송 성공"});
        } catch (err) {
            next(err);
        }
    }

    async emailAuth(req, res, next){
        try {
            const { university_email, authNum } = req.body;

            await redisClient.get(university_email, (err,storedAuthNum) => {
                if (err) {
                    res.status(500).json({ message: "Redis에서 인증번호 가져오기 오류" });
                } else {
                if (authNum === storedAuthNum) {
                    this.UserService.updateEmailAuthStatus(req.user.id, university_email);
                    res.status(200).json({ message: "인증 성공"});
                } else {
                    res.status(404).json({ message: "인증번호가 일치하지 않습니다." });
                }
            }
        });
    } catch (err) {
        next(err);
    }
    }
}

const authController = new AuthController();
export default authController;