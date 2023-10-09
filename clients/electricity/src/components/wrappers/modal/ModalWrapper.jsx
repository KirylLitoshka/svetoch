import React from 'react';
import "./ModalWrapper.css"

const ModalWrapper = ({isVisible, setIsVisible, children}) => {
    const classes = ["modal"]

    if (isVisible) {
       classes.push("modal__active")
    }

    return (
        <div className={classes.join(" ")} onClick={() => setIsVisible(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
};

export default ModalWrapper;