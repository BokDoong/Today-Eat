import { Router } from "express";
import { UserService } from "../service";
import { imageUploader } from "../../../middleware"
import { CreateInquiryDTO } from "../dto/inquiry/create-inquiry.dto";

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

    this.router.post("/inquiry", imageUploader.array('images'), this.createInquiry.bind(this));
    this.router.get("/inquiry/:id", this.getInquiry.bind(this));
    this.router.get("/inquirys", this.getInquirys.bind(this));
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

  // 문의하기
  async createInquiry(req, res, next) {
    try {
      // 저장되는 파일의 이름명(key) 갖고오기: [ '1689548132927', '1689548132932' ]
      // 저장되는 파일경로: [버킷명].s3.[지역명].amazonaws.com/[req.file.key]
      const filePaths = req.files.map(file => process.env.AWS_S3_BUCKET + ".s3." + process.env.AWS_S3_REGION + ".amazonaws.com/" + file.key);
      const body = JSON.parse(req.body['dto']);
      
      const newInquiryId = await this.userService.createInquiry(
        new CreateInquiryDTO({
          title: body.title,
          content: body.content,
          userId: req.user.id,
          inquiryImages: filePaths
        })
      );


      res.status(201).json({ id: newInquiryId });
    } catch(err) {
      next(err);
    }
  }

  // 문의 전체조회
  async getInquirys(req, res, next) {
    try {
      const status = req.query.status;
      const { inquirys } = await this.userService.getInquirys(status);

      res.status(200).json({ inquirys });
    } catch(err) {
      next(err);
    }
  }

  // 문의 개별조회
  async getInquiry(req, res, next) {
    try {
      const { id } = req.params;

      const inquiry = await this.userService.getInquiry(id);

      res.status(200).json({ inquiry });
    } catch(err) {
      next(err);
    }
  }
}

const userController = new UserController();
export default userController;