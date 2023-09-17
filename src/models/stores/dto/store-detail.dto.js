export class StoreDetailDTO{
    storeId;
    storeName;
    category;
    imageUrl;
    keywords;
    tags;
    closeTime;
    phoneNumber;
    address;
    time;
    imageCount;
    x;
    y;
    reviewCount;
    isWishlist;

    constructor(props) {
        this.storeId = props.Id;
        this.storeName = props.name;
        this.category = props.category;
        this.imageUrl = props.imageUrl;
        this.phoneNumber = props.phoneNumber;
        this.address = props.address;
        this.time = props.time;
        this.closeTime = props.closeTime;
        this.keywords = props.keywords;
        this.tags = props.tags;
        this.imageCount = props.imageCount;
        this.x = props.x;
        this.y = props.y;
        this.reviewCount = props.reviewCount;
        this.isWishlist = props.isWishlist;
    }
    
}