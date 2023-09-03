export class CreateReviewDTO{
    storeId;
    content;
    score;
    images;
    tags;
    keywords;

    constructor(props){
        this.storeId = props.storeId;
        this.content = props.content;
        this.score = props.score;
        this.images = props.images;
        this.keywords = props.keywords;
        this.tags = props.tags;
    }
}