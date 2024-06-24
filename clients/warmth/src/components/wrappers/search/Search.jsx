import React from "react";
import "./Search.css";

const Search = (props) => {
  return <div className="search" style={props.style}>{props.children}</div>;
};

export default Search;
