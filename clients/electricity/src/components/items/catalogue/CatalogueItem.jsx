import React from "react";
import "./CatalogueItem.css"

const CatalogueItem = (props) => {
  return (
    <div className="catalogue-item">
      {
        props.title && <h3 className="catalogue-item__title">{props.title}</h3>
      }
      {props.children}
    </div>
  )
};

export default CatalogueItem