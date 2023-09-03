import { CampersDTO } from "./campers";

export class UserDTO {
  id;
  nickname;
  imageURL;
  campers;
  isEmailAuth;

  constructor(props) {
    this.id = props.id;
    this.nickname = props.nickname;
    this.imageURL = props.imageURL;
    this.isEmailAuth = props.isEmailAuth;
    
    // Null 허용(임시 적용)
    if(props.campers == null) {
      this.campers = null;
    } else {
      this.campers = new CampersDTO(props.campers);      
    }
  }
}