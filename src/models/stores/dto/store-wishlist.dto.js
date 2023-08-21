export class StoreWishlistDTO{
    storeId;
    name;
    rank;
    score;
    reviewCount;
    time;
    imageUrl;
    reviewContent;
    category;

    constructor(props){
        this.storeId = props.id;
        this.name = props.name;
        this.time = props.time;
        this.imageUrl = props.imageUrl;
        this.rank = props.rank;
        this.score = props.score;
        this.reviewCount = props.reviewCount;
        this.reviewContent = props.reviewContent;
        this.category = props.category;
    }
}