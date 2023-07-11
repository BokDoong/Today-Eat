import { Router } from "express";
import { UserService } from "../service";

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
  }

  // 공지사항 확인
  async getNotice(req, res, next) {
    try {
      const { notices } = await this.userService.getNotice();

      res.status(200).json({ notices });
    } catch (err) {
      next(err);
    }
  }
}

const userController = new UserController();
export default userController;