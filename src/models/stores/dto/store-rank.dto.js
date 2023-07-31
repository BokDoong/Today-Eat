export class StoreRankDTO{
    id;
    name;
    category;
    time;
    status;
    score;
    reviewCount;
    imageURL;
    imageCount;
    reviewSample;
    wishlist;

    constructor(props) {
        this.id = props.id;
        this.name = props.name;
        this.category = props.category;
        this.time = (props.distance*0.014).toFixed();
        this.status = props.status;
        this.score = props.score;
        this.reviewCount = props.reviewCount;
        this.imageURL = props.imageUrl;
        this.reviewSample = props.reviewSample;
        this.wishlist = props.wishlist;
    }
    
}