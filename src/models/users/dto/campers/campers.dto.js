import { UniversityDTO } from "./university.dto";

export class CampersDTO {
  name;
  university;

  constructor(props) {
    this.campers = props.name;
    this.university = new UniversityDTO(props.university);
  }
}