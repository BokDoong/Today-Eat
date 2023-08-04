export class StoreCardDTO{
    id;
    name;
    time;
    category;
    tags;
    isWishlist;
    imageURL;

    constructor(props) {
        this.id = props.id;
        this.name = props.name;
        this.time = props.time;
        this.category = props.category;
        this.tags = props.tags;
        this.isWishlist = props.isWishlist;
        this.imageURL = props.imageURL;
    }
    
}