export class StoreMapDTO{
    id;
    x;
    y;
    isWishlist;

    constructor(props){
        this.id = props.id;
        this.x = props.x;
        this.y = props.y;
        this.isWishlist = props.isWishlist;
    }
}