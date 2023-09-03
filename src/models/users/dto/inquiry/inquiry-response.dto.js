export class InquiryResponseDTO {
  id;
  content;

  constructor(props) {
    this.id = props.id;
    this.content = props.content;
  }
}