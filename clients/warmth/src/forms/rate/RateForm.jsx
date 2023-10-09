import React, { useEffect, useState } from "react";
import Button from "../../components/ui/buttons/base/Button";

const RateForm = ({ selectedItem, onCreate, onUpdate }) => {
  const [rateItem, setRateItem] = useState({ title: "", is_currency_coefficient_applied: false });

  useEffect(() => {
    if (selectedItem) {
      setRateItem(selectedItem);
    } else {
      setRateItem({ title: "", is_currency_coefficient_applied: false });
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
          value={rateItem.title}
          onChange={(e) => {
            setRateItem({ ...rateItem, title: e.target.value });
          }}
        />
      </div>
      <div className="form-row">
        <label htmlFor="is_currency_coefficient_applied" className="form_label">
          Применение
        </label>
        <input
          type="checkbox"
          id="is_currency_coefficient_applied"
          className="form_input"
          checked={rateItem.is_currency_coefficient_applied}
          onChange={(e) => {
            setRateItem({ ...rateItem, is_currency_coefficient_applied: !rateItem.is_currency_coefficient_applied });
          }}
        />
      </div>
      <div className="form-row">
        {selectedItem ? (
          <Button text={"Обновить"} callback={() => onUpdate(rateItem)} />
        ) : (
          <Button text={"Добавить"} callback={() => onCreate(rateItem)} />
        )}
      </div>
    </React.Fragment>
  );
};

export default RateForm;
