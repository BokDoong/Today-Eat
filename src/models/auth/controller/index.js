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
        this.router.post("/logout", this.logout.bind(this));
        this.router.post("/refresh",this.refresh.bind(this));
        this.router.post("/email",this.emailSend.bind(this));
        this.router.post("/email-auth", this.emailAuth.bind(this));
        this.router.post("/delete-user", this.deleteUser.bind(this));
        this.router.post("/password-reset", this.passwordReset.bind(this));
        this.router.get("/searchUniversities", this.searchUniversities.bind(this));
    }

    // 회원가입
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
                    phoneNumber: body.phoneNumber,
                    imageURL: filePath,
                    isEmailAuth: body.isEmailAuth,
                    campersId: body.campersId,
                    password: body.password,
                    agreement: body.agreement,
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

    // 로그인
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

    // 로그아웃
    async logout(req, res, next) {
        try{
            const body = req.body;

            await this.authService.logout(req.user.email, body.accessToken);

            res.status(200).json({message:"logout 성공"});
        } catch(err) {
            next(err);
        }
    }

    // 토큰 재발급
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
    
    // 이메일 전송
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

    // 이메일 인증
    async emailAuth(req, res, next){
        try {
            const { university_email, authNum } = req.body;

            await redisClient.get(university_email, (err,storedAuthNum) => {
                if (err) {
                    res.status(500).json({ message: "Redis에서 인증번호 가져오기 오류" });
                } else {
                if (authNum === storedAuthNum) {
                    if(req.user.id){
                        this.UserService.updateEmailAuthStatus(req.user.id, university_email);
                    }
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

    // 회원탈퇴
    async deleteUser(req, res, next) {
        try{
            if(!req.user) throw { status: 401, message: "로그인을 진행해주세요." };
            
            await this.authService.deleteUser(req.user.id);

            res.status(200).json({message: "회원 탈퇴 성공" });
        } catch(err) {
            next(err);
        }
    }

    async passwordReset(req, res, next) {
        try{
            const { email } = req.body;

            await this.authService.passwordReset(email);

            res.status(200).json({message:"성공"});

        } catch(err) {
            next(err);
        }
    }

    async searchUniversities(req, res, next) {
        try{
            const searchWord = req.query.keyword;
            const campers = await this.authService.searchUniversities(searchWord);

            res.status(200).json(campers);
        } catch(err) {
            next(err);
        }
    }
}

const authController = new AuthController();
export default authController;