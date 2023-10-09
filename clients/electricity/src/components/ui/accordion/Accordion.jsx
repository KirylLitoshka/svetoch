import React from "react";
import "./Accordion.css";

const Accordion = (props) => {
  return <div className="accordion-list">{props.children}</div>;
};

export default Accordion;
