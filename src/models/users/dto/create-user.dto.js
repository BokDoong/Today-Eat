export class CreateUserDTO{
    email;
    name;
    password;
    nickname;
    university_email;
    classOf;
    imageURL;
    phoneNumber;
    isEmailAuth;
    campersId;

    constructor(props){
        this.email = props.email;
        this.name = props.name;
        this.password = props.password;
        this.nickname = props.nickname;
        this.university_email = props.university_email;
        this.classOf = props.classOf;
        this.imageURL = props.imageURL;
        this.phoneNumber = props.phoneNumber;
        this.isEmailAuth = props.isEmailAuth;
        this.campersId = props.campersId;
    }
}