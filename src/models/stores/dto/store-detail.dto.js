export class StoreDetailDTO{
    storeId;
    storeName;
    category;
    imageUrl;
    keywords;
    tags;
    status;
    closeTime;
    phoneNumber;
    address;
    time;

    constructor(props) {
        this.storeId = props.Id;
        this.storeName = props.name;
        this.category = props.category;
        this.imageUrl = props.imageUrl;
        this.phoneNumber = props.phoneNumber;
        this.address = props.address;
        this.time = props.time;
        this.status = props.status;
        this.closeTime = props.closeTime;
        this.keywords = props.keywords;
        this.tags = props.tags;
    }
    
}