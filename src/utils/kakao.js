import axios from "axios";
import dotenv from "dotenv";
import database from "../database";
import jwt from "jsonwebtoken";
import { redisClient } from "./redis";

dotenv.config();

export class Kakao{

    constructor(){
        this.key = process.env.KAKAO_RESTAPIKEY;
        this.redirectUri = "http://localhost:8000/api/v1/auth/kakao-login";
    }

    getAuthCodURL(){
        return `https://kauth.kakao.com/oauth/authorize?client_id=${this.key}&redirect_uri=${this.redirectUri}&response_type=code`;
    }

    //토큰 얻기
    async getToken(code) {
        
        const params = {
            client_id: this.key,
            code,
            grant_type: "authorization_code",
            redirect_uri: this.redirectUri,
          };
      
          const { data } = await axios.post(
            "https://kauth.kakao.com/oauth/token",
            params,
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
          );
        console.log(data);
        // const tokenData = {

        //     access_token: data.access_token,
        //     // refresh_token: data.refresh_token,
        //   };
          console.log(data.access_token);
      
          return { kakaoAccessToken: data.access_token };
    }

    // 유저 정보 가져오기
    async getUserData(token) {

        const { data } = await axios.get("https://kapi.kakao.com/v2/user/me", {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Bearer ${token}`,
            },
        });
    
        const userExist = await database.user.findUnique({
            where: {
                email: data.kakao_account.email,
            },
        });

        if (!userExist) {
            const registerAccessToken = jwt.sign({ id: data.id, email: data.kakao_account.email }, process.env.JWT_KEY,{
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