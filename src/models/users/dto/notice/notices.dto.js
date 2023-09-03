export class NoticesDTO {
  id;
  title;
  content;

  constructor(props) {
    this.id = props.id;
    this.title = props.title;
    this.content = props.content;
  }

}