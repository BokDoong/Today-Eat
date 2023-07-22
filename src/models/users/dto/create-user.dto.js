export class CreateUserDTO{
    email;
    name;
    password;
    nickname;
    classOf;
    imageURL;
    phoneNumber;
    campersId;

    constructor(props){
        this.email = props.email;
        this.name = props.name;
        this.password = props.password;
        this.nickname = props.nickname;
        this.classOf = props.classOf;
        this.imageURL = props.imageURL;
        this.phoneNumber = props.phoneNumber;
        this.campersId = props.campersId;
    }
}