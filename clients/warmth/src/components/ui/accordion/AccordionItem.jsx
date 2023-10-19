import React from "react";
import "./AccordionItem.css";
import ControlsMenu from "../control/ControlsMenu";

const AccordionItem = ({ title, controls, children, selected, callback }) => {
  const onSelect = (e) => {
    let content = e.target.nextElementSibling;
    if (e.target.classList.contains('accordion-item_button')) {
      e.target.classList.toggle("accordion-item_button__active")
    } else {
      content = e.target.parentElement.nextElementSibling
      e.target.parentElement.classList.toggle("accordion-item_button__active")
    }
    if (content.style.maxHeight) {
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    }
  };

  return (
    <div className="accordion-item">
      <div
        className={
          "accordion-item_button" +
          (selected ? " accordion-item_button__active" : "")
        }
        onClick={callback || onSelect}
      >
        {title}
      </div>
      <div className="accordion-item_content">
        <div className="accordion-item_content-wrapper">{children}</div>
        <ControlsMenu controls={controls} />
      </div>
    </div>
  );
};

export default AccordionItem;
