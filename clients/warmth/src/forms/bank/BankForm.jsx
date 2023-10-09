import React, { useEffect, useState } from "react";
import Button from "../../components/ui/buttons/base/Button";

const BankForm = ({ selectedItem, onCreate, onUpdate }) => {
  const [bankItem, setBankItem] = useState({ title: "", code: "" });

  useEffect(() => {
    if (selectedItem) {
      setBankItem(selectedItem);
    } else {
      setBankItem({ title: "", code: "" });
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
          value={bankItem.title}
          onChange={(e) => {
            setBankItem({ ...bankItem, title: e.target.value });
          }}
        />
      </div>
      <div className="form-row">
        <label htmlFor="code" className="form_label">
          Код банка
        </label>
        <input
          type="text"
          id="code"
          className="form_input"
          value={bankItem.code}
          onChange={(e) => {
            setBankItem({ ...bankItem, code: e.target.value });
          }}
        />
      </div>
      <div className="form-row">
        {selectedItem ? (
          <Button text={"Обновить"} callback={() => onUpdate(bankItem)} />
        ) : (
          <Button text={"Добавить"} callback={() => onCreate(bankItem)} />
        )}
      </div>
    </React.Fragment>
  );
};

export default BankForm;
