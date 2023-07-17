import database from "../../../database";
import { NoticesDTO } from "../dto";

export class UserService {

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