import { CampersDTO } from "../dto/campers"

export class UserDetailDTO {
  id;
  name;
  nickname;
  email;
  university_email;
  imageURL;
  campers;
  isEmailAuth;
  agreement;

  constructor(props) {
    this.id = props.id;
    this.name = props.name;
    this.nickname = props.nickname;
    this.email = props.email;
    this.university_email = props.university_email;
    this.imageURL = props.imageURL;
    this.isEmailAuth = props.isEmailAuth;
    this.agreement = props.agreement;
    
    // Null 허용
    if(props.campers == null) {
      this.campers = null;
    } else {
      this.campers = new CampersDTO(props.campers);      
    }
  }
}