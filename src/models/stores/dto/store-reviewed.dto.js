export class StoreReviewedDTO{
    storeId;
    name;
    rank;
    status;
    score;
    reviewCount;
    distance;
    imageUrl;
    reviewSample;
    isWishlist;
    category;

    constructor(props){
        this.storeId = props.id;
        this.name = props.name;
        this.distance = props.distance;
        this.imageUrl = props.imageUrl;
        this.rank = props.rank;
        this.status = props.status;
        this.score = props.score;
        this.reviewCount = props.reviewCount;
        this.reviewSample = props.reviewSample;
        this.isWishlist = props.isWishlist;
        this.category = props.category;
    }
}