import React from "react";
import "./CloseButton.css";

const CloseButton = ({closeAction}) => {
  return <div className="button_close" onClick={() => closeAction(false)}></div>;
};

export default CloseButton;
