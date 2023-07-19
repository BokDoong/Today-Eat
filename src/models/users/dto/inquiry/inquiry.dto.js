import { InquiryResponseDTO } from "../inquiry/inquiry-response.dto";

export class InquiryDTO {
  id;
  title;
  content;
  createdAt;
  inquiryImages;  // 배열
  inquiryResponse;

  constructor(props) {
    this.id = props.id;
    this.title = props.title;
    this.content = props.content;
    this.createdAt = props.createdAt;
    this.status = props.status;
    this.inquiryImages = props.inquiryImages;

    if(props.inquiryResponse) {
      this.inquiryResponse = new InquiryResponseDTO(props.inquiryResponse);
    } else {
      this.inquiryResponse = null;
    }
  }
}