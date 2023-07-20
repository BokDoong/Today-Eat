export class StoreCardDTO{
    id;
    name;
    time;
    category;
    tags;

    constructor(props,tags) {
        this.id = props.id;
        this.name = props.name;
        this.time = (props.distance*0.014).toFixed();
        this.category = props.category;
        this.tags = [...tags];
    }
    
}