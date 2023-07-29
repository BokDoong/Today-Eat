export class StoreRecommendDTO{
    id;
    name;
    category;
    distance
    status;
    score;
    reviewCount;
    imageUrl;

    constructor(props) {
        this.id = props.id;
        this.name = props.name;
        this.category = props.category;
        this.imageUrl = props.imageUrl;
        this.distance = props.distance;
        this.status = props.status;
        this.score = props.score;
        this.reviewCount = props.reviewCount;
    }
}