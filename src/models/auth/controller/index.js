import { Router, response } from "express";
import { AuthService } from "../service";
import { LoginDTO, RegisterDTO } from "../dto";
import { redisClient } from "../../../utils/redis";


class AuthController {
    authService;
    router;
    path = "/api/v1/auth";

    constructor() {
        this.router = Router();
        this.authService = new AuthService();
        this.init();
    }

    init() {
        this.router.post("/register", this.register.bind(this));
        this.router.post("/login", this.login.bind(this));
        this.router.post("/refresh",this.refresh.bind(this));
        this.router.post("/email",this.emailSend.bind(this));
        this.router.post("/email-auth", this.emailAuth.bind(this));
    }

    async register(req, res, next) {
        try{
            const body = req.body;

            const { accessToken, refreshToken } = await this.authService.register(
                new RegisterDTO(body)
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
            const { email } = req.body;

            await this.authService.sendMail(email, authNum);

            res.status(200).json({message: "메일 전송 성공"});
        } catch (err) {
            next(err);
        }
    }

    async emailAuth(req, res, next){
        try {
        const { email, authNum } = req.body;

        // Retrieve the stored authentication number from Redis
        await redisClient.get(email, (err, storedAuthNum) => {
            if (err) {
                console.error("Redis에서 인증번호 가져오기 오류", err);
                res.status(500).json({ message: "Redis에서 인증번호 가져오기 오류" });
            } else {
                if (authNum === storedAuthNum) {
                    res.status(200).json({ message: "이메일 인증 성공" });
                } else {
                    res.status(200).json({ message: "인증번호가 일치하지 않습니다." });
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