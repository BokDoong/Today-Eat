export class ReviewDTO{
    reviewId;
    userName;
    imageUrls;
    score;
    tags;
    createdDate;
    likeCount;
    content;

    constructor(props) {
        this.reviewId = props.id;
        this.userName = props.userName;
        this.imageUrls = props.imageUrls;
        this.score = props.score;
        this.tags = props.tags.map((tag)=>tag.name);
        this.createdDate = props.createdDate;
        this.likeCount = props._count.reviewLikes;
        this.content = props.content;
    }
    
}