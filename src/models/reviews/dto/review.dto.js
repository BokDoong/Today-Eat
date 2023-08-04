export class ReviewDTO{
    reviewId;
    nickname;
    imageUrls;
    score;
    tags;
    createdDate;
    likeCount;
    content;

    constructor(props) {
        this.reviewId = props.id;
        this.nickname = props.nickname;
        this.imageUrls = props.imageUrls;
        this.score = props.score;
        this.tags = props.tags.map((tag)=>tag.name);
        this.createdDate = props.createdDate;
        this.likeCount = props._count.reviewLikes;
        this.content = props.content;
    }
    
}