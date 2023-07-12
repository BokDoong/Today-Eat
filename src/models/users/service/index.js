import database from "../../../database";
import { NoticesDTO } from "../dto";

export class UserService {


  // 공지사항 확인
  async getNotice() {
    const notices = await database.notices.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return { notices: notices.map((notice) => new NoticesDTO(notice)) };
  }
}