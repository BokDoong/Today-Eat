import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

export class UpdatePasswordDTO {

  oldPassword;
  newPassword;

  constructor(props) {
    this.oldPassword = props.oldPassword;
    this.newPassword = props.newPassword;
  }

  async hashPassword() {
    const hashedPassword = await bcrypt.hash(
      this.newPassword,
      Number(process.env.PASSWORD_SALT)
    );

    return hashedPassword;
  }

  async comparePassword(password){
    const isPasswdCorrect = await bcrypt.compare(this.oldPassword, password);
    return isPasswdCorrect;
}
}