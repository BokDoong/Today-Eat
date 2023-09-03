import bcrypt from "bcrypt"
import dotenv from "dotenv";

dotenv.config();

export class RegisterDTO{

    email;
    name;
    university_email;
    password;
    nickname;
    imageURL;
    campersId;
    isEmailAuth;
    agreement;

    constructor(props){
        this.email = props.email;
        this.name = props.name;
        this.university_email = props.university_email;
        this.password = props.password;
        this.nickname = props.nickname;
        this.imageURL = props.imageURL;
        this.isEmailAuth = props.isEmailAuth;
        this.campersId = props.campersId;
        this.agreement = props.agreement;
    }

    async agreementCheck() {
        if(this.agreement == "true") {
            return true;
        }

        return false;        
    }

    async hashPassword() {
        if(this.password){
        const hashedPassword = await bcrypt.hash(
          this.password,
          Number(process.env.PASSWORD_SALT)
        );
    
        return hashedPassword;
        } else return null;
    }
}