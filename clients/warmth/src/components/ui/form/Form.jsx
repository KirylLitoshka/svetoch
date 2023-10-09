import React from "react";
import ModalWrapper from "../../wrappers/modal/ModalWrapper";
import "./Form.css";


const Form = ({ isModal, modalVisible, closeModal, component }) => {
  if (isModal) {
    return (
      <ModalWrapper isVisible={modalVisible} closeModal={closeModal}>
        <div className="form">{component}</div>
      </ModalWrapper>
    );
  }
  return <div className="form">{component}</div>;
};

export default Form;
