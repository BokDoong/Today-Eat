import bcrypt from "bcrypt"
import dotenv from "dotenv";

dotenv.config();

export class RegisterDTO{

    email;
    name;
    university_email;
    password;
    nickname;
    classOf;
    imageURL;
    phoneNumber;
    campersId;
    isEmailAuth;

    constructor(props){
        this.email = props.email;
        this.name = props.name;
        this.university_email = props.university_email;
        this.password = props.password;
        this.nickname = props.nickname;
        this.classOf = props.classOf;
        this.imageURL = props.imageURL;
        this.phoneNumber = props.phoneNumber;
        this.isEmailAuth = props.isEmailAuth;
        this.campersId = props.campersId;
    }

    async hashPassword() {
        const hashedPassword = await bcrypt.hash(
          this.password,
          Number(process.env.PASSWORD_SALT)
        );
    
        return hashedPassword;
    }
}