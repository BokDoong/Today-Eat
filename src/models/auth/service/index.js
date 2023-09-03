import database from "../../../database";
import bcrypt from "bcrypt";
import { CreateUserDTO } from "../../users/dto"
import { UserService } from "../../users/service"
import { redisClient, smtpTransport } from "../../../utils";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export class AuthService{
    userService;

    constructor(){
        this.userService = new UserService();
    }

    // 회원가입
    async register(props){

        if(!props.name) throw { status:406, message:"이름을 입력해 주세요."};
        if(props.name.length > 8 ) throw { status: 407, message:"이름의 길이는 최대 8자 입니다."};

        const emailExist = await this.userService.checkUserByEmail(props.email);
        if(emailExist) throw { status: 400, message: "이미 가입되어있는 이메일 입니다."};

        // const emailPattern = /^[A-Za-z0-9_\.\-]+@[A-Za-z0-9\-]+\.[A-Za-z0-9\-]+/;
        // const isEmailVaild = emailPattern.test(props.email);
        
        // if(!isEmailVaild) throw {status: 408, message: "이메일 형식이 아닙니다."};

        // if(!props.nickname) throw { status: 409, message:"닉네임을 입력해 주세요."};

        // const nicknamePattern = /[~!@#$%^&*()_+|<>?:{}]/;
        // if(nicknamePattern.test(props.nickname)) throw { status:410, message:"특수문자는 사용 불가능 합니다."};
        // if(props.nickname.length > 8) throw { status: 411, message:"닉네임의 길이는 최대 8자 입니다."};

        // const nicknameExist = await this.userService.checkUserByNickname(props.nickname);
        // if(nicknameExist) throw { status: 412, message:"이미 존재하는 닉네임입니다."};

        if(props.university_email){
            const uniEmailExist = await this.userService.checkUserByUniEmail(props.university_email);
            if(uniEmailExist) throw { status: 413, message:"이미 존재하는 학교이메일 입니다."};
        }

        //createDTO사용해서 유저 생성
        const newUserId = await this.userService.createUser(
            new CreateUserDTO({
                ...props,

                agreement: await props.agreementCheck(),
                password: await props.hashPassword(),
            })
        );
        
        const accessToken = jwt.sign({ id: newUserId }, process.env.JWT_KEY,{
            expiresIn:"2h",
        });
        const refreshToken = jwt.sign({ id: newUserId }, process.env.JWT_KEY,{
            expiresIn:"14d",
        });

        await redisClient.set(newUserId, refreshToken);
        await redisClient.expire(newUserId, 60 * 60 * 24 * 14);

        return { accessToken, refreshToken };
    }

    // 로그인
    async login(props){

        const emailExist = await this.userService.checkUserByEmail(props.email);
        if(!emailExist) throw { status:404, message:"이메일을 잘못 입력했습니다."};

        const isPasswdCorrect = await props.comparePassword(emailExist.password);
        if(!isPasswdCorrect) throw { status:400, message:"비밀번호를 잘못 입력했습니다."};
        
        const accessToken = jwt.sign({ id: emailExist.id }, process.env.JWT_KEY,{
            expiresIn:"2h",
        });
        const refreshToken = jwt.sign({ id: emailExist.id }, process.env.JWT_KEY,{
            expiresIn:"14d",
        });
        
        await redisClient.set(emailExist.id, refreshToken);
        await redisClient.expire(emailExist.id, 60 * 60 * 24 * 14);

        return { accessToken, refreshToken };
    }

    async getAppleInfo(id_token){
        const { sub: id, email } = (jwt.decode(id_token) ?? {} );
            if(id) {
                const userExist = await database.user.findUnique({
                    where: {
                        email: email,
                    },
                });

                if(!userExist){
                    const registerAccessToken = jwt.sign({ id:id, email:email }, process.env.JWT_KEY,{
                        expiresIn:"2h",
                    });

                    return { registerAccessToken: registerAccessToken };
                } else{
                    const accessToken = jwt.sign({ id: userExist.id }, process.env.JWT_KEY,{
                        expiresIn:"2h",
                    });
                    const refreshToken = jwt.sign({ id: userExist.id }, process.env.JWT_KEY,{
                        expiresIn:"14d",
                    });
                    
                    await redisClient.set(userExist.id, refreshToken);
                    await redisClient.expire(userExist.id, 60 * 60 * 24 * 14);

                    return {
                        accessToken: accessToken,
                        refreshToken: refreshToken,
                };
                }
            }
    }

    // 로그아웃
    async logout(email, accessToken) {

        const emailExist = await this.userService.checkUserByEmail(email);
        const expiration = await this.getExpiration(accessToken);

        await redisClient.del(emailExist.id);
        await redisClient.set(accessToken, "logout");
        await redisClient.expire(accessToken, expiration);
    }

    // 토큰 재발급
    async refresh(accessToken, refreshToken) {

        const accessTokenPayload = jwt.verify(accessToken, process.env.JWT_KEY,{
            ignoreExpiration: true,
        });
        const refreshTokenPayload = jwt.verify(refreshToken, process.env.JWT_KEY);

        if (accessTokenPayload.id !== refreshTokenPayload.id){
            throw { status: 403, message:"권한이 없습니다."};
        }

        const user = await this.userService.findUserById(accessTokenPayload.id);

        const newAccessToken = jwt.sign({ id: user.id }, process.env.JWT_KEY,{
            expiresIn:"2h",
        });
        const newRefreshToken = jwt.sign({ id: user.id }, process.env.JWT_KEY,{
            expiresIn:"14d",
        });

        await redisClient.set(user.id, newRefreshToken);
        await redisClient.expire(user.id, 60 * 60 * 24 * 14);

        return{
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    }

    // 대학교 검색
    async searchUniversities(word) {

        const universities = await database.university.findMany({
          where: {
            name: {
              contains: word,
            },
          },
          include: {
            campers: true,
          },
        });
      
        const searchResults = universities.map((university) => {
          return {
            universityName: university.name,
            campers: university.campers.map((camper) => ({
                campersId: camper.id,
                campersName: camper.name,
            })),
          };
        });
      
        return searchResults;
    }
    
    // 회원 탈퇴
    async deleteUser(userId) {

        const user = await database.user.findUnique({
            where: {
              id: userId,
            },
          });
        
        await database.user.delete({
            where:{
                id:user.id
            }
        });
    }

    // 비밀번호 초기화
    async passwordReset(email) {

        const randomPasswd = Math.random().toString(36).slice(2);

        const hashedPassword = await bcrypt.hash(
            randomPasswd,
            Number(process.env.PASSWORD_SALT),
          );

        const mailOptions = {
            from: "bobmeokgongofficial@naver.com",
            to: email,
            subject:"임시 비밀번호 발급",
            html: '<h1>임시 비밀번호 입니다. 해당 비밀번호로 로그인 후 비밀번호를 변경해 주세요.</h1>' + randomPasswd
        }

        const emailExist = await this.userService.checkUserByEmail(email);

        if(!emailExist) throw { status:404, message:"해당 사용자를 찾을 수 없습니다."};

        await smtpTransport.sendMail(mailOptions);
        await database.user.update({
            where: {
                email: emailExist.email,
            },
            data: {
                password: hashedPassword,
            },
        });
        
    }

    // 이메일 전송
    async sendMail(university_email, authNum) {
        const mailOptions = {
            from: "bobmeokgongofficial@naver.com",
            to: university_email,
            subject:"이메일 인증 번호",
            html: '<h1>인증번호를 입력해주세요</h1>' + authNum
        }

        const emailExist = await this.userService.checkUserByUniEmail(university_email);
        
        if(emailExist) throw { status: 400, message: "이미 가입되어있는 이메일 입니다."};
        
        const emailPattern = /@.*ac\.kr$/;
        const isEmailVaild = emailPattern.test(university_email);
        
        if(!isEmailVaild) throw {status: 404, message: "학교 이메일 형식이 아닙니다."};

        await smtpTransport.sendMail(mailOptions);
        await redisClient.set(university_email, authNum);
        await redisClient.expire(university_email, 180);
    }

    // 인증번호 생성
    async generateRandomNum(){
        const min = 1000;
        const max = 9999;

        const randomNum = Math.floor(Math.random()*(max-min+1)) + min;
        return randomNum;
    }

    // accessToken 만료시간
    async getExpiration(accessToken){
        try {
            const decodedToken = jwt.verify(accessToken, process.env.JWT_KEY);
            const now = Math.floor(Date.now() / 1000);
        
            if (decodedToken.exp) {

                const remainingTime = decodedToken.exp - now;
                return remainingTime;
            } else {
                throw new Error('Token has no "exp" claim');
            }

        } catch(err){
            console.log("Error", err.message);
            throw err;
        }
    }
}
