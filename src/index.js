import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Controllers } from './models';
import { swaggerDocs, options } from './swagger';
import swaggerUi from "swagger-ui-express";
import database from "./database";
import { jwtAuth } from './middleware/jwtAuth';
import schedule from "node-schedule";
import {storeService} from "./models/stores/service";
import {writeTimeLog} from "./utils"

(async() => {
  const app = express();
  await database.$connect();

  // 미들웨어
  app.use(cors());
  app.use(helmet());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true, limit: "700mb"}));
  app.use(jwtAuth);

  // Controller Path 매핑
  Controllers.forEach((controller) => {
    app.use(controller.path, controller.router);
  });

  // Swagger 설정: ~~~/api-docs
  app.get("/swagger.json", (req, res) => {
    res.status(200).json(swaggerDocs);
  });
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(undefined, options));

  // "/" 기본 Api Path
  app.get("/", (req, res) => {
    res.send("Fighting!!")
  })

  // 에러처리 핸들러
  app.use((err, req, res, next) => {
    console.log(err);
      
    res
      .status(err.status || 500)
      .json({message: err.message || "서버에서 에러가 발생했습니다."});
  })

  // Port번호 8000 설정
  app.listen(8000, async () => {
    console.log("Server's started!!");
    await storeService.updateRank();
    writeTimeLog();
    schedule.scheduleJob('0 0 0 * *',async () => {
      await storeService.updateRank();
      writeTimeLog();
    })
  })
})();