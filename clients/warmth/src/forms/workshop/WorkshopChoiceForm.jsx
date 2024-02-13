import React, { useState } from "react";
import Button from "../../components/ui/buttons/base/Button";

const WorkshopChoiceForm = ({ workshops, confirmCallback }) => {
  const [selectedID, setSelectedID] = useState("");

  return (
    <React.Fragment>
      <div className="form-row" style={{ fontSize: "22px" }}>
        <label htmlFor="workshop" className="form_label">
          По цеху:
        </label>
        <select
          name="workshop"
          id="workshop"
          className="form_input"
          style={{ fontSize: "18px" }}
          value={selectedID}
          onChange={(e) => setSelectedID(e.target.value)}
        >
          <option value="" disabled>
            Не указан
          </option>
          {workshops.map((wshop) => (
            <option value={wshop.id} key={wshop.id}>
              {wshop.title}
            </option>
          ))}
        </select>
      </div>
      <div className="form-row">
        <Button text={"Сформировать отчет"} callback={() => confirmCallback(selectedID)} />
      </div>
    </React.Fragment>
  );
};

export default WorkshopChoiceForm;
