import React from "react";
import "./PageWrapper.css";

const PageWrapper = (props) => {
  return <div className="page-content">{props.children}</div>;
};

export default PageWrapper;
