import React from "react";
import "./Error.css";

const Error = (props) => {
  return (
    <div className="error">
      <div className="error_message">
        {props.message}
      </div>
      {props.children}
    </div>
  );
};

export default Error;
