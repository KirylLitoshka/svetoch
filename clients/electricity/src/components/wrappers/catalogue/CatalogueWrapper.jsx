import React from "react";
import "./CatalogueWrapper.css"

const CatalogueWrapper = (props) => {
  return <div className="catalogue">{props.children}</div>;
};

export default CatalogueWrapper;
