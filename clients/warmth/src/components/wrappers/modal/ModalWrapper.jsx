import React from 'react';
import "./ModalWrapper.css"

const ModalWrapper = ({isVisible, closeModal, children}) => {
    const classes = ["modal"]

    if (isVisible) {
       classes.push("modal__active")
    }

    return (
        <div className={classes.join(" ")} onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
};

export default ModalWrapper;