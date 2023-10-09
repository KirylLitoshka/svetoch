import React from "react";
import "../Button.css";

const Button = ({ size, type, action }) => {
  return (
    <button
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`button button_${type}`}
      onClick={action}
    />
  );
};

export default Button;
