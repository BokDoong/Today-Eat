import { Router } from "express";
import { UserService } from "../service";
import { imageUploader } from "../../../middleware"

class UserController {
  router;
  path = "/api/v1/users";
  userService;

  constructor() {
    this.router = new Router();
    this.userService = new UserService();
    this.init();
  }

  init() {
    this.router.get("/notice", this.getNotice.bind(this));

    this.router.post("/test", imageUploader.single('image'), this.testImage.bind(this));
  }

  // 공지사항 확인
  async getNotice(req, res, next) {
    try {
      const type = req.query.type;
      const { notices } = await this.userService.getNotice(type);

      res.status(200).json({ notices });
    } catch (err) {
      next(err);
    }
  }

  // 이미지 업로드 테스트
  async testImage(req, res, next) {
    try {
      res.send("good!");
    } catch(err) {
      next(err);
    }
  }
}

const userController = new UserController();
export default userController;