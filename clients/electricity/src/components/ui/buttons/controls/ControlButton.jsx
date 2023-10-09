import React from "react";
import { Link } from "react-router-dom";
import "./ControlButton.css"

const ControlButton = ({ label, type, callback, linkURL, linkState }) => {
  if (type === "button") {
    return (
      <button className="control-button" onClick={callback}>
        {label}
      </button>
    );
  } else {
    return (
      <Link to={linkURL} state={linkState} className="control-button">
        {label}
      </Link>
    );
  }
};

export default ControlButton;
