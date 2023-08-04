export class StoreDetailMapDTO{
    storeId;
    name;
    category;
    rank;
    status;
    score;
    reviewCount;
    time;
    reviewImage;
    reviewContent;
    isWishlist;

    constructor(props){
        this.storeId = props.id;
        this.name = props.name;
        this.category = props.category;
        this.time = props.time;
        this.rank = props.rank;
        this.status = props.status;
        this.score = props.score;
        this.reviewImage = props.reviewImage;
        this.reviewCount = props.reviewCount;
        this.reviewContent = props.reviewContent;
        this.isWishlist = props.isWishlist;
    }
}