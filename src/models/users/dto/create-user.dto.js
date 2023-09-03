export class CreateUserDTO{
    email;
    name;
    password;
    nickname;
    imageURL;
    isEmailAuth;
    agreement;
    campersId;
    university_email;
    

    constructor(props){
        this.email = props.email;
        this.name = props.name;
        this.password = props.password;
        this.nickname = props.nickname;
        this.imageURL = props.imageURL;
        this.isEmailAuth = props.isEmailAuth;
        this.agreement = props.agreement;
        this.campersId = props.campersId;
        this.university_email = props.university_email;
    }
}