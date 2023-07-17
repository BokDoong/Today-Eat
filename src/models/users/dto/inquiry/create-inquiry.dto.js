export class CreateInquiryDTO {
  title;
  content;
  status;
  inquiryImages;
  userId;

  constructor(props) {
    this.title = props.title;
    this.content = props.content;
    this.userId = props.userId;
    this.inquiryImages = props.inquiryImages;
    this.status = "WAITING";
  }
}