import React, { useEffect, useState } from "react";
import { months } from "../../utils/date";
import Button from "../../components/ui/buttons/base/Button";

const RateHistoryForm = ({ selectedItem, onCreate, onUpdate }) => {
  const [historyItem, setHistoryItem] = useState({
    month: null,
    year: null,
    value_1: null,
    value_2: null,
  });

  useEffect(() => {
    if (selectedItem?.id) {
      setHistoryItem(selectedItem);
    } else {
      setHistoryItem({
        month: null,
        year: null,
        value_1: null,
        value_2: null,
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
          value={historyItem.month || ""}
          onChange={(e) =>
            setHistoryItem({ ...historyItem, month: +e.target.value + 1 })
          }
        >
          <option disabled value={""}>
            Укажите месяц
          </option>
          {months.map((month, index) => (
            <option key={index} value={index}>
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
          step={1}
          className="form_input"
          value={historyItem.year || ""}
          onChange={(e) =>
            setHistoryItem({ ...historyItem, year: +e.target.value })
          }
        />
      </div>
      <div className="form-row">
        <label htmlFor="value_1" className="form_label">
          Тариф 1
        </label>
        <input
          id="value_1"
          type="number"
          step={"any"}
          className="form_input"
          value={historyItem.value_1 === null ? "" : historyItem.value_1}
          onChange={(e) => {
            const value = parseFloat(e.target.value);
            setHistoryItem({
              ...historyItem,
              value_1: isNaN(value) ? null : value,
            });
          }}
        />
      </div>
      <div className="form-row">
        <label htmlFor="value_2" className="form_label">
          Тариф 2
        </label>
        <input
          id="value_2"
          type="number"
          step={"any"}
          className="form_input"
          value={historyItem.value_2 === null ? "" : historyItem.value_2}
          onChange={(e) => {
            const value = parseFloat(e.target.value);
            setHistoryItem({
              ...historyItem,
              value_2: isNaN(value) ? null : value,
            });
          }}
        />
      </div>
      <div className="form-row">
        {selectedItem ? (
          <Button text={"Обновить"} callback={() => onUpdate(historyItem)} />
        ) : (
          <Button text={"Добавить"} callback={() => onCreate(historyItem)} />
        )}
      </div>
    </React.Fragment>
  );
};

export default RateHistoryForm;
