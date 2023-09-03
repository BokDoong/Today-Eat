import { Router, response } from "express";
import { AuthService } from "../service";
import { LoginDTO, RegisterDTO } from "../dto";
import { redisClient, getAppleToken, Kakao } from "../../../utils"
import { UserService } from "../../users/service";
import { imageUploader } from "../../../middleware"
import jwt from "jsonwebtoken";

class AuthController {
    authService;
    router;
    path = "/api/v1/auth";

    constructor() {
        this.router = Router();
        this.authService = new AuthService();
        this.UserService = new UserService();
        this.kakao = new Kakao();
        this.init();
    }

    init() {
        this.router.post("/register", imageUploader.single('image'), this.register.bind(this));
        this.router.post("/email-validate", this.emailValidation.bind(this));
        this.router.post("/nickname-validate", this.nicknameValidation.bind(this));
        this.router.post("/login", this.login.bind(this));
        this.router.post("/logout", this.logout.bind(this));
        this.router.post("/refresh",this.refresh.bind(this));
        this.router.post("/email",this.emailSend.bind(this));
        this.router.post("/email-auth", this.emailAuth.bind(this));
        this.router.post("/delete-user", this.deleteUser.bind(this));
        this.router.post("/password-reset", this.passwordReset.bind(this));
        this.router.get("/searchUniversities", this.searchUniversities.bind(this));

        this.router.post("/apple-login", this.appleLogin.bind(this));
        this.router.get("/kakao-authCode", this.getAuthCode.bind(this));
        this.router.post("/kakao-login", this.kakaoLogin.bind(this));
    }

    // 회원가입
    async register(req, res, next) {
        try{
            // if (!req.file) throw { status: 401, message: "file이 없습니다." };
            let filePath = null;

            if(req.file){
                filePath = process.env.AWS_S3_BUCKET + ".s3." + process.env.AWS_S3_REGION + ".amazonaws.com/" + req.file.key;
            }
            const body = JSON.parse(req.body['dto']);
            
            if(body.registerAccessToken){
                const {id, email } = jwt.verify(body.registerAccessToken, process.env.JWT_KEY);
                const { accessToken, refreshToken } = await this.authService.register(
                    new RegisterDTO({
                        id: id.toString(),
                        email: email,
                        name: body.name,
                        university_email: body.university_email,
                        nickname: body.nickname,
                        imageURL: filePath,
                        campersId: body.campersId,
                        password: null,
                    })
                );

                res.status(200).json({
                    accessToken,
                    refreshToken,
                  });
            } else {
            const { accessToken, refreshToken } = await this.authService.register(
                new RegisterDTO({
                    email: body.email,
                    name: body.name,
                    university_email: body.university_email,
                    nickname: body.nickname,
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
        }
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
            const accessToken = req.header("Authorization")?.split(" ")[1];

            await this.authService.logout(req.user.email, accessToken);

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
            res.status(200).json({message: "메일 전송 성공"});
        } catch (err) {
            next(err);
        }
    }

    // 이메일 중복 검사
    async emailValidation(req, res, next){
        try{
            const { email } = req.body;

            if(!email) throw { status: 409, message:"이메일을 입력해 주세요."};

            const emailPattern = /^[A-Za-z0-9_\.\-]+@[A-Za-z0-9\-]+\.[A-Za-z0-9\-]+/;
            const isEmailVaild = emailPattern.test(email);
            
            if(!isEmailVaild) throw {status: 408, message: "이메일 형식이 아닙니다."};

            const emailExist = await this.UserService.checkUserByEmail(email);
            if(emailExist) throw { status: 400, message: "이미 가입되어있는 이메일 입니다."};

            res.status(200).json({ message:"이메일 중복 검사 완료"});
        } catch(err) { 
            next(err);
        }
    }

    //닉네임 중복 검사
    async nicknameValidation(req, res, next){
        try{
            const { nickname } = req.body;

            if(!nickname) throw { status: 409, message:"닉네임을 입력해 주세요."};

            const nicknamePattern = /[~!@#$%^&*()_+|<>?:{}]/;
            if(nicknamePattern.test(nickname)) throw { status:410, message:"특수문자는 사용 불가능 합니다."};

            if(nickname.length > 8) throw { status: 411, message:"닉네임의 길이는 최대 8자 입니다."};

            const nicknameExist = await this.UserService.checkUserByNickname(nickname);
            if(nicknameExist) throw { status: 400, message:"이미 존재하는 닉네임입니다."};

            res.status(200).json({ message:"닉네임 중복 검사 완료"});

        } catch(err){
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
                    if(req.user){
                        this.UserService.updateEmailAuthStatus(req.user.id, university_email);

                        res.status(200).json({message:"학교 이메일 인증 성공"})
                    } else{
                    res.status(201).json({ message: "학교 이메일 인증 성공 , 인증 상태 변경"});
                    }
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

    // 비밀번호 초기화
    async passwordReset(req, res, next) {
        try{
            const { email } = req.body;

            await this.authService.passwordReset(email);

            res.status(200).json({message:"성공"});

        } catch(err) {
            next(err);
        }
    }

    // 대학교 검색
    async searchUniversities(req, res, next) {
        try{
            const searchWord = req.query.keyword;
            const campers = await this.authService.searchUniversities(searchWord);

            res.status(200).json(campers);
        } catch(err) {
            next(err);
        }
    }

    //애플 로그인
    async appleLogin(req, res, next) {
        try{
            const { code, id_token } = req.body;
            const { data } = await getAppleToken(code);
            const result = await this.authService.getAppleInfo(id_token);
            
            res.status(200).json({result});
        } catch(err) {
            next(err);
        }
    }

    // 카카오 인가 코드 받기
    async getAuthCode(req, res, next) {
        try{
            const url = this.kakao.getAuthCodURL();

            res.status(200).json({
                url,
            });
        } catch(err) {
            next(err);
        }
    }

    // 카카오 로그인
    async kakaoLogin(req, res, next) {
        try {
            const {kakaoAccessToken} = req.body;

            // const { kakaoAccessToken } = await this.kakao.getToken(code);

            const result = await this.kakao.getUserData(kakaoAccessToken);

            res.status(200).json({ result });
        } catch(err) {
            next(err);
        }
    }
}

const authController = new AuthController();
export default authController;