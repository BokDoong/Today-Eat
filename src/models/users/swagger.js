export const getNotice = {
  "/api/v1/users/notice": {
    get: {
      tags: ["Notice"],
      summary: "공지사항 조회",
      description: "공지사항을 시간순(최근 등록순)으로 조회합니다.",
      parameter: [],
      responses: {
        200: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  notices: {
                    type: "object",
                    example: 
                      [
                        { "title": "추석 이벤트1", "content": "추석맞이 이벤트입니다_1" },
                        { "title": "추석 이벤트2", "content": "추석맞이 이벤트입니다_2" },
                        { "title": "추석 이벤트3", "content": "추석맞이 이벤트입니다_3" },
                      ]
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};