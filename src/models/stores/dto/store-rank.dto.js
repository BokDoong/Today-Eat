export class StoreRankDTO{
    id;
    name;
    category;
    time;
    status;
    score;
    reviewCount;
    imageURLs;
    imageCount;
    reviewSample;
    wishlist;

    constructor(props,status,score,reviewCount,image,reviewSample,wishlist) {
        this.id = props.id;
        this.name = props.name;
        this.category = props.name;
        this.time = (props.distance*0.014).toFixed();
        this.status = status;
        this.score = score;
        this.reviewCount = reviewCount;
        this.imageURLs = image.imageURLs;
        this.imageCount = image.imageCount;
        this.reviewSample = reviewSample;
        this.wishlist = wishlist;
    }
    
}