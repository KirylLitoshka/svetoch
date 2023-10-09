import React from "react";
import "./Notification.css";

const Notification = ({ text, onSubmitAction, onCloseAction }) => {
  return (
    <div className="notify">
      <h2 className="notify_message">{text}</h2>
      <div className="notify-buttons">
        <button
          className="confirm_button confirm_button__accept"
          onClick={onSubmitAction}
        >
          Да
        </button>
        <button
          className="confirm_button confirm_button__cancel"
          onClick={() => onCloseAction(false)}
        >
          Нет
        </button>
      </div>
    </div>
  );
};

export default Notification;
