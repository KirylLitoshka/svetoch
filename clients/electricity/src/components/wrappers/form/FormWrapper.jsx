import React from "react";
import "./FormWrapper.css";

const FormWrapper = (props) => {
  return (
    <div className={props.bordered ? "form-wrapper form-wrapper__bordered" : "form-wrapper"}>
      <form className="form">{props.children}</form>
    </div>
  );
};

export default FormWrapper;
