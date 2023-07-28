export class StoreDetailMapDTO{
    storeId;
    name;
    category;
    rank;
    status;
    score;
    reviewCount;
    distance;
    reviewImage;
    reviewSample;
    isWishlist;

    constructor(props){
        this.storeId = props.id;
        this.name = props.name;
        this.category = props.category;
        this.distance = props.distance;
        this.rank = props.rank;
        this.status = props.status;
        this.score = props.score;
        this.reviewImage = props.reviewImage;
        this.reviewCount = props.reviewCount;
        this.reviewSample = props.reviewSample;
        this.isWishlist = props.isWishlist;
    }
}