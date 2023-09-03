export class CreaetInquiryResponseDTO {
  id;
  content;
  inquiryId;

  constructor(props) {
    this.id = props.id;
    this.content = props.content;
    this.inquiryId = props.inquiryId;
  }
}