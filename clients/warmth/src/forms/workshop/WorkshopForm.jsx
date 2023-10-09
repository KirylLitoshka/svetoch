import React, { useEffect, useState } from "react";
import Button from "../../components/ui/buttons/base/Button";

const WorkshopForm = ({ selectedItem, onCreate, onUpdate }) => {
  const [workshop, setWorkshop] = useState({ title: "" });

  useEffect(() => {
    if (selectedItem) {
      setWorkshop(selectedItem);
    } else {
      setWorkshop({ title: "" });
    }
  }, [selectedItem]);

  return (
    <React.Fragment>
      <div className="form-row">
        <label htmlFor="title" className="form_label">
          Наименование
        </label>
        <input
          className="form_input"
          id="title"
          type="text"
          value={workshop.title}
          onChange={(e) => setWorkshop({ ...workshop, title: e.target.value })}
        />
      </div>
      <div className="form-row">
        {selectedItem ? (
          <Button text={"Обновить"} callback={() => onUpdate(workshop)} />
        ) : (
          <Button text={"Добавить"} callback={() => onCreate(workshop)} />
        )}
      </div>
    </React.Fragment>
  );
};

export default WorkshopForm;
