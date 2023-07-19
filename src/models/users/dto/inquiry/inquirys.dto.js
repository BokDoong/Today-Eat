export class InquirysDTO {
  id;
  title;
  content;
  createdAt;
  status;

  constructor(props) {
    this.id = props.id;
    this.title = props.title;
    this.content = props.content;
    this.createdAt = props.createdAt;
    this.status = props.status;
  }
}