import React from "react";
import "./Button.css";

const Button = ({ text, callback }) => {
  return (
    <button
      className="button"
      onClick={(e) => {
        e.preventDefault();
        callback();
      }}
    >
      {text}
    </button>
  );
};

export default Button;
