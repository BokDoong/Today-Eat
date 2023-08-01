export const createReview = {
    "/api/v1/reviews": {
      post: {
        tags: ["Review"],
        summary: "리뷰 생성",
        security: [
          {
            bearerAuth: [],
          },
        ],
        requestBody: {
          content: {
            "multipart/form-data": {
                schema: {
                    type: "object",
                    properties: {
                    storeId: {
                        type: "string",
                    },
                    content: {
                        type: "string",
                    },
                    score:{
                        type:"float",
                    },
                    tags: {
                        type: "array",
                        items: {
                        type: "string",
                        },
                    },
                    keywords: {
                        type: "array",
                        items: {
                        type: "string",
                        },
                    },
                },
              },
            },
          },
        },
        responses: {
          201: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
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

export const deleteReview = {
    "/api/v1/reviews/:id": {
        delete: {
            tags: ["Review"],
            summary: "리뷰 삭제",
            security: [
                {
                bearerAuth: [],
                },
            ],
            parameters: [
                {
                in: "path",
                name: "id",
                required: true,
                schema: {
                    type: "string",
                },
                description:"삭제할 리뷰 ID"
                },
            ],
            responses: {
                204: {
                content: {
                    "application/json": {
                    schema: {
                        type: "object",
                        properties: {},
                    },
                    },
                },
                },
            },
        },
    },
};


export const updateReview = {
    "/api/v1/reviews/:id": {
      put: {
        tags: ["Review"],
        summary: "리뷰 수정",
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
            {
            in: "path",
            name: "id",
            required: true,
            schema: {
                type: "string",
            },
            description:"수정할 리뷰 ID"
            },
        ],
        requestBody: {
          content: {
            "multipart/form-data": {
                schema: {
                    type: "object",
                    properties: {
                    storeId: {
                        type: "string",
                    },
                    content: {
                        type: "string",
                    },
                    score:{
                        type:"float",
                    },
                    tags: {
                        type: "array",
                        items: {
                        type: "string",
                        },
                    },
                    keywords: {
                        type: "array",
                        items: {
                        type: "string",
                        },
                    },
                },
              },
            },
          },
        },
        responses: {
          201: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
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