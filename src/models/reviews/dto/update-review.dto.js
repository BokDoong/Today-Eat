export class UpdateReviewDTO{
    content;
    score;
    images;
    tags;
    keywords;

    constructor(props){
        this.content = props.content;
        this.score = props.score;
        this.images = props.images;
        this.keywords = props.keywords;
        this.tags = props.tags;
    }
}