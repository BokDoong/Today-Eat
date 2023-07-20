import {UserService} from "../../users/service";
import {StoreService} from "../../stores/service";
import database from "../../../database";

export class ReviewService{
    userService;
    storeService;
    constructor(){
        this.userService = new UserService();
        this.storeService = new StoreService();
    }


    //리뷰 작성
    createReview = async (props) => {
        const user = await this.userService.findUserById(props.userId);
        const store = await this.storeService.findStoreByID(props.storeId);
        const newReview = await database.review.create({
            data:{
                content:props.content,
                score:props.score,
                user:{
                    connect:{
                        id:user.id,
                    }
                },
                store:{
                    connect:{
                        id:store.id,
                    },
                },
                keywords:{
                    createMany:{
                        data:props.keywords.map((keyword)=>({
                            name:keyword,
                            storeId:store.id,
                        })),
                    }
                },
                tags:{
                    createMany:{
                        data:props.tags.map((tag)=>({
                            name:tag,
                            storeId:store.id,
                        })),
                    }
                },
                reviewImages:{
                    createMany:{
                        data:props.images.map((image)=>({imageUrl:image}))
                    }
                }
            }
        })

        return newReview.id;
    }
}