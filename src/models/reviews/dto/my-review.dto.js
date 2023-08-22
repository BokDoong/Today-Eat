export class MyReviewDTO{
    id;
    nickname;
    score;
    content;
    tags;
    images;
    likeCount;
    createdDate;
    userImage;

    constructor(props){
        this.id = props.id;
        this.score = props.score;
        this.content = props.content;
        this.tags = props.tags;
        this.images = props.reviewImages;
        this.likeCount = props.likeCount;
        this.createdDate = props.createdDate;
        this.nickname = props.nickname;
        this.userImage = props.userImage;
    }
}