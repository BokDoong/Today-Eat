import { CampersDTO } from "./campers";

export class UserDTO {
  id;
  name;
  imageURL;
  campers;
  isEmailAuth;

  constructor(props) {
    this.id = props.id;
    this.name = props.name;
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