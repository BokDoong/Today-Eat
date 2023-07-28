import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { redisClient } from "../utils";
import database from "../database";
dotenv.config();

export const jwtAuth = async (req, res, next) => {
  try {
    const headers = req.headers;
    const authorization = headers["authorization"] || headers["Authorization"];
    if (
      authorization?.includes("Bearer") ||
      authorization?.includes("bearer")
    ) {
      if (typeof authorization === "string") {
        const bearers = authorization.split(" ");
        if (bearers.length === 2 && typeof bearers[1] === "string") {
          const accessToken = bearers[1];
          //redis에 엑세스 토큰 존재여부 확인
          redisClient.get(accessToken, async (err, reply) => {
            if (err) {
              console.error("Error checking token in Redis:", err);
              next({ status: 500, message: "Internal Server Error" });
            } else if (reply) {
              
              next({ status: 401, message: "로그아웃 처리된 엑세스 토큰입니다." });
            } else {
              
              try {
                const decoded = jwt.verify(accessToken, process.env.JWT_KEY);
                const user = await database.user.findUnique({
                  where: {
                    id: decoded.id,
                  },
                });

                if (user) {
                  req.user = user;
                } else {
                  req.user = undefined;
                }

                next();
              } catch(err){
                next();
              }
            }
          });
        } else {
          next({ status: 400, message: "Authorization Fail" });
        }
      } else {
        next({ status: 400, message: "Authorization Fail" });
      }
    } else {
      next();
    }
  } catch (err) {
    next(err);
  }
};