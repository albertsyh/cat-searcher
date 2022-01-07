import cx from "classnames";

const ImageBlock = ({ className, src, alt }) => (
  <div className={cx("card", className)}>
    <img className="card-img-top" src={src} alt={alt} />
  </div>
);

export default ImageBlock;
