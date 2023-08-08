export class StoreRankDTO{
    id;
    name;
    category;
    time;
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
        this.score = props.score;
        this.reviewCount = props.reviewCount;
        this.imageURL = props.imageURL;
        this.reviewContent = props.reviewContent;
        this.wishlist = props.wishlist;
    }
    
}