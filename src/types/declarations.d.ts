declare module "*.css" {
  interface IStyle {
    [className: string]: string;
  }
  const styles: IStyle;
  export default styles;
}

declare module "*.module.css" {
  interface IStyle {
    [className: string]: string;
  }
  const styles: IStyle;
  export default styles;
}
