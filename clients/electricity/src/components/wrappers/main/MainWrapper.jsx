import React from "react";
import "./MainWrapper.css";

const MainWrapper = (props) => {
  return (
    <main className="page-main">
      <div className="content_container">{props.children}</div>
    </main>
  );
};

export default MainWrapper;
