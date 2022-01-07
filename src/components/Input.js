import cx from "classnames";
import searchIcon from "../search.svg";

const Input = ({
  autoComplete = "off",
  className,
  type = "text",
  ...props
}) => (
  <input
    type={type}
    autoComplete={autoComplete}
    className={cx("form-control", className)}
    {...props}
  />
);

const SearchInput = ({ prediction, isLoading, className, ...props }) => {
  return (
    <div className="input-group position-relative">
      {/* This shows the typeahead */}
      <Input
        className={cx(
          "position-absolute bg-white text-muted border-0 pe-none",
          className
        )}
        value={prediction}
        style={{
          left: 0,
          top: 0,
          bottom: 0,
          right: 0,
          width: "calc(100% - 50px)",
        }}
        readOnly
      />
      {/* This is the actual input */}
      <Input className={cx("bg-transparent", className)} {...props} />
      <button
        type="submit"
        className="btn btn-outline-secondary"
        disabled={isLoading}
        style={{ width: "50px" }}
      >
        {isLoading ? (
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        ) : (
          <img
            src={searchIcon}
            alt="searchIcon"
            style={{ width: "24px", height: "24px" }}
          />
        )}
      </button>
    </div>
  );
};

export { SearchInput };

export default Input;
