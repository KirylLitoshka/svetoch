import React from "react";
import "./AccordionButton.css"

const AccordionButton = ({ label, action }) => {
  return <button className="accordion-list_button" onClick={action}>{label}</button>;
};

export default AccordionButton;
