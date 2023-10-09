import React from 'react';
import "./Confirm.css"

const Confirm = ({onConfirmAction, onCloseAction}) => {
    return (
        <div className="confirm">
            <h2 className="confirm_title">Удалить?</h2>
            <div className="confirm_buttons">
                <button className="confirm_button confirm_button__accept" onClick={onConfirmAction}>Да</button>
                <button className="confirm_button confirm_button__cancel" onClick={() => onCloseAction(false)}>Нет</button>
            </div>
        </div>
    );
};

export default Confirm;