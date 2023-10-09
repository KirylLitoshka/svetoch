import React from "react";
import "./CatalogueControl.css"

const CatalogueControl = (props) => {
  return <div className="catalogue-control">
    {props.children}
  </div>
};

export default CatalogueControl;
