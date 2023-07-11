import database from "../../../database";
import { NoticeDTO } from "../dto";

export class UserService {


  // 공지사항 확인
  async getNotice() {
    const notices = await database.notice.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return { notices: notices.map((notice) => new NoticeDTO(notice)) };
  }
}