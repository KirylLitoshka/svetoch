import React, { useEffect, useState } from "react";
import Button from "../../components/ui/buttons/base/Button";

const CodeForm = ({ selectedItem, onCreate, onUpdate }) => {
  const [codeItem, setCodeItem] = useState({ title: "" });

  useEffect(() => {
    if (selectedItem) {
      setCodeItem(selectedItem);
    } else if (selectedItem === null) {
      setCodeItem({ title: "" });
    }
  }, [selectedItem]);

  return (
    <React.Fragment>
      <div className="form-row">
        <label htmlFor="title" className="form_label">
          Наименование
        </label>
        <input
          type="text"
          id="title"
          className="form_input"
          value={codeItem.title}
          onChange={(e) => setCodeItem({ ...codeItem, title: e.target.value })}
        />
      </div>
      <div className="form-row">
        {selectedItem ? (
          <Button text={"Обновить"} callback={() => onUpdate(codeItem)} />
        ) : (
          <Button text={"Добавить"} callback={() => onCreate(codeItem)} />
        )}
      </div>
    </React.Fragment>
  );
};

export default CodeForm;
