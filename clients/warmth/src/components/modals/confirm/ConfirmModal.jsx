import React from "react";
import ModalWrapper from "../../wrappers/modal/ModalWrapper";
import Button from "../../ui/buttons/base/Button";
import "./ConfirmModal.css"

const ConfirmModal = ({ message, isVisible, closeModal, onConfirm }) => {
  return (
    <ModalWrapper isVisible={isVisible} closeModal={closeModal}>
      <div className="confirm"></div>
        <h2 className="confirm_message">{message}</h2>
        <div className="confirm_buttons">
          <Button text={"Продолжить"} callback={onConfirm}/>
          <Button text={"Отмена"} callback={closeModal}/>
        </div>
    </ModalWrapper>
  );
};

export default ConfirmModal;
