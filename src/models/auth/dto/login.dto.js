import bcrypt from "bcrypt";

export class LoginDTO{
    email;
    password;

    constructor(props){
        this.email = props.email;
        this.password = props.password;
    }

    async comparePassword(password){
        const isPasswdCorrect = await bcrypt.compare(this.password, password);
        return isPasswdCorrect;
    }
}