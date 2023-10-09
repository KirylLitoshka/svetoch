import React from "react";
import "./Accordion.css";

const Accordion = (props) => {
  return <div className="accordion">{props.children}</div>;
};

export default Accordion;
