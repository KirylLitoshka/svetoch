import React, { useEffect, useState } from "react";
import Button from "../../components/ui/buttons/base/Button";
import { months } from "../../utils/date";

const CurrencyForm = ({ selectedItem, onCreate, onUpdate }) => {
  const [currencyItem, setCurrencyItem] = useState({
    year: new Date().getFullYear(),
    month: 1,
    value_1: "",
    value_2: "",
  });

  useEffect(() => {
    if (selectedItem) {
      setCurrencyItem(selectedItem);
    } else {
      setCurrencyItem({
        year: new Date().getFullYear(),
        month: 1,
        value_1: "",
        value_2: "",
      });
    }
  }, [selectedItem]);

  return (
    <React.Fragment>
      <div className="form-row">
        <label className="form_label" htmlFor="month">
          Месяц
        </label>
        <select
          className="form_input"
          name="month"
          id="month"
          required
          value={currencyItem.month}
          onChange={(e) =>
            setCurrencyItem({ ...currencyItem, month: +e.target.value })
          }
        >
          {months.map((month, index) => (
            <option key={index} value={index + 1}>
              {month}
            </option>
          ))}
        </select>
      </div>
      <div className="form-row">
        <label htmlFor="year" className="form_label">
          Год
        </label>
        <input
          id="year"
          type="number"
          required
          className="form_input"
          value={currencyItem.year || ""}
          onChange={(e) =>
            setCurrencyItem({ ...currencyItem, year: parseInt(e.target.value) || null })
          }
        />
      </div>
      <div className="form-row">
        <label htmlFor="value_1" className="form_label">
          Коэффициент 1
        </label>
        <input
          id="value_1"
          type="number"
          required
          className="form_input"
          value={[undefined, NaN, null].includes(currencyItem.value_1) ? "" : currencyItem.value_1}
          onChange={(e) =>
            setCurrencyItem({
              ...currencyItem,
              value_1: e.target.value
            })
          }
        />
      </div>
      <div className="form-row">
        <label htmlFor="value_2" className="form_label">
          Коэффициент 2
        </label>
        <input
          id="value_2"
          type="number"
          required
          className="form_input"
          value={[undefined, NaN, null].includes(currencyItem.value_2) ? "" : currencyItem.value_2}
          onChange={(e) =>
            setCurrencyItem({
              ...currencyItem,
              value_2: e.target.value,
            })
          }
        />
      </div>
      <div className="form-row">
        {selectedItem ? (
          <Button text={"Обновить"} callback={() => onUpdate(currencyItem)} />
        ) : (
          <Button text={"Добавить"} callback={() => onCreate(currencyItem)} />
        )}
      </div>
    </React.Fragment>
  );
};

export default CurrencyForm;
