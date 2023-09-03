export const getNotice = {
  "/api/v1/users/notice": {
    get: {
      tags: ["Notice"],
      summary: "공지사항 조회",
      description: "공지사항을 시간순(최근 등록순)으로 조회합니다.",
      parameters: [
        {
          in: "query",
          name: "type",
          required: "true",
          description: "TERMS: 약관, NOTICE: 공지사항, FAQ: FAQ",
          schema: {
            type: "string",
          },
        }
      ],
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
                        { "id": "1", "title": "추석 이벤트1", "content": "추석맞이 이벤트입니다_1" },
                        { "id": "1", "title": "추석 이벤트2", "content": "추석맞이 이벤트입니다_2" },
                        { "id": "1", "title": "추석 이벤트3", "content": "추석맞이 이벤트입니다_3" },
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