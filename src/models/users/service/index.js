import database from "../../../database";
import { NoticesDTO } from "../dto";
import { InquiryDTO } from "../dto/inquiry/inquiry.dto";
import { InquirysDTO } from "../dto/inquiry/inquirys.dto";

export class UserService {

  // 문의 답변하기
  async createInquiryResponse(props) {

    const inquiry = await database.inquiry.findUnique({
      where: {
        id: props.inquiryId,
      },
    });

    if(!inquiry) throw { status: 404, message: "문의글을 찾을 수 없습니다."};

    const newInquiryResponse = await database.inquiryResponse.create({
      data: {
        content: props.content,
        inquiry: {
          connect: {
            id: inquiry.id,
          },
        },
      },
    });

    // 상태 변경
    await database.inquiry.update({
      where: {
        id: inquiry.id,
      },
      data: {
        status: 'DONE',
      },
    });

    return newInquiryResponse.id;
  }

  // 개별 문의확인
  async getInquiry(id) {
    const inquiry = await database.inquiry.findUnique({
      where: {
        id,
      },
      include: {
        inquiryImages: true,
        inquiryResponse: true,
      },
    });

    if(!inquiry) throw { status: 404, message: "문의글을 찾을 수 없습니다." };

    return new InquiryDTO(inquiry);
  }

  // 전체 문의확인
  async getInquirys(statusValue) {

    // 쿼리파라미터 검사
    if (statusValue !== 'WAITING' && statusValue !== 'DONE')
      throw {status: 404, message: "잘못된 Status 입니다."};

    const inquirys = await database.inquiry.findMany({
      where: {
        status: statusValue,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { inquirys: inquirys.map((inquiry) => new InquirysDTO(inquiry)) }
  }

  // 문의하기, props: CreateInquiryDTO
  async createInquiry(props) {
    const user = await this.findUserById(props.userId);

    const newInquiry = await database.inquiry.create({
      data: {
        title: props.title,
        content: props.content,
        status: props.status,
        user: {
          connect: {
            id: user.id,
          },
        },
        inquiryImages: {
          createMany: {
            data: props.inquiryImages.map((inquiryImage) => ({ imageUrl: inquiryImage})),
          },
        },
      },
    });

    return newInquiry.id;
  }

  // 공지사항 확인
  async getNotice(typeValue) {

    // 쿼리파라미터 검사
    if (typeValue !== 'TERMS' && typeValue !== 'FAQ' && typeValue !== 'NOTICE')
      throw {status: 404, message: "잘못된 Type 입니다."};

    const notices = await database.notices.findMany({
      where: {
        type: typeValue,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { notices: notices.map((notice) => new NoticesDTO(notice)) };
  }

  //유저 확인
  async findUserById(id){
    const user = await database.user.findUnique({
      where: {
        id,
      },
    });

    if(!user) throw { status: 404, message:"유저를 찾을 수 없습니다."};
    return user;
  }
  
  // 이메일 확인
  async checkUserByEmail(email){
    const user = await database.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) return false;

    return user;
  }

  // 회원가입
  async createUser(props){
    const newUser = await database.user.create({
      data: {
        email: props.email,
        name: props.name,
        nickname: props.nickname,
        classOf:props.classOf,
        imageURL:props.imageURL,
        phoneNumber:props.phoneNumber,
        password:props.password,
        campersId:props.campersId,
      },
    });
    
    return newUser.id;
  }
}