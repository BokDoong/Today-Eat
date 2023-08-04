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
    reviewContent;
    wishlist;

    constructor(props) {
        this.id = props.id;
        this.name = props.name;
        this.category = props.category;
        this.time = props.time;
        this.status = props.status;
        this.score = props.score;
        this.reviewCount = props.reviewCount;
        this.imageURL = props.imageURL;
        this.reviewContent = props.reviewContent;
        this.wishlist = props.wishlist;
    }
    
}