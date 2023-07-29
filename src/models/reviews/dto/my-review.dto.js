export class MyReviewDTO{
    id;
    userName;
    score;
    content;
    tags;
    images;
    likeCount;
    createdDate;

    constructor(props){
        this.id = props.id;
        this.score = props.score;
        this.content = props.content;
        this.tags = props.tags;
        this.images = props.reviewImages;
        this.likeCount = props.likeCount;
        this.createdDate = props.createdDate;
        this.userName = props.userName;
    }
}