export const getRankSample = {
    "api/v1/stores/rank-sample":{
        get:{
            tags:["Store"],
            summary:"랭킹 샘플 조회",
            security: [
                {
                  bearerAuth: [],
                },
            ],
            responses: {
                201:{
                    content:{
                        "application/json":{
                            schema:{
                                type:"array",
                                items:{
                                    type:"object",
                                    properties:{
                                        "store":{
                                            type:"object",
                                            properties:{
                                                id:{
                                                    type:"string"
                                                },
                                                name:{
                                                    type:"string"
                                                },
                                                time:{
                                                    type:"string"
                                                },
                                                category:{
                                                    type:"string"
                                                },
                                                tags:{
                                                    type:"array",
                                                    items:{
                                                        type:"string"
                                                    }
                                                },
                                                isWishlist:{
                                                    type:"boolean"
                                                }
                                            }
                                        },
                                        "tag":{
                                            type:"string"
                                        }
                                    }
                                }   
                            }
                        }
                    }
                }
            }
        }
    }
}