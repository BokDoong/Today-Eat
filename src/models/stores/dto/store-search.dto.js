export class StoreSearchDTO{
    id;
    name;
    category;
    time;
    status;
    score;
    reviewCount;
    imageUrl;

    constructor(props) {
        this.id = props.id;
        this.name = props.name;
        this.category = props.category;
        this.imageUrl = props.imageUrl;
        this.time = props.time;
        this.status = props.status;
        this.score = props.score;
        this.reviewCount = props.reviewCount;
    }
}