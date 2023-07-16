export class CreateUserDTO{
    email;
    name;
    password;
    nickname;
    classOf;
    imageURL;
    phoneNumber;
    campersId;

    constructor(user){
        this.email = user.email;
        this.name = user.name;
        this.password = user.password;
        this.nickname = user.nickname;
        this.classOf = user.classOf;
        this.imageURL = user.imageURL;
        this.phoneNumber = user.phoneNumber;
        this.campersId = user.campersId;
    }
}