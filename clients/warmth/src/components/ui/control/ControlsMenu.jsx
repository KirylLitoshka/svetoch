import React from "react";
import "./ControlsMenu.css";
import Button from "../buttons/base/Button";

const ControlsMenu = ({ controls }) => {
  return (
    <div className="controls-menu">
      {controls.map((control, index) => (
        <Button key={index} text={control.label} callback={() => control.callback(control.item)} />
      ))}
    </div>
  );
};

export default ControlsMenu;
