export class CreateReviewDTO{
    storeId;
    content;
    score;
    images;
    tags;
    keywords;
    userId;

    constructor(props){
        this.storeId = props.storeId;
        this.userId = props.userId;
        this.content = props.content;
        this.score = props.score;
        this.images = props.images;
        this.keywords = props.keywords;
        this.tags = props.tags;
    }
}