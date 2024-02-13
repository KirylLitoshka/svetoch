import React, { useEffect } from "react";
import { useState } from "react";
import { months } from "../../utils/date";
import Button from "../../components/ui/buttons/base/Button";

const PaymentForm = ({ selectedItem, onUpdate, onCreate }) => {
  const initialPaymentValue = {
    month: 1,
    year: new Date().getFullYear(),
    payment_type: 1,
    ncen: 1,
    applied_rate_value: "",
    heating_value: "",
    heating_cost: "",
    water_heating_value: "",
    water_heating_cost: "",
  };
  const [payment, setPayment] = useState(initialPaymentValue);

  useEffect(() => {
    if (selectedItem?.id) {
      setPayment(selectedItem);
    } else {
      setPayment(initialPaymentValue);
    }
  }, [selectedItem]);

  return (
    <React.Fragment>
      <div className="form-row">
        <label htmlFor="month" className="form_label">
          Месяц
        </label>
        <select
          name="month"
          id="month"
          className="form_input"
          value={payment.month}
          onChange={(e) => setPayment({ ...payment, month: +e.target.value })}
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
          type="number"
          id="year"
          className="form_input"
          value={payment.year}
          onChange={(e) => setPayment({ ...payment, year: +e.target.value })}
        />
      </div>
      <div className="form-row">
        <label htmlFor="payment_type" className="form_label">
          Тип платежа
        </label>
        <select
          name="payment_type"
          id="payment_type"
          className="form_input"
          value={payment.payment_type}
          onChange={(e) =>
            setPayment({ ...payment, payment_type: e.target.value })
          }
        >
          <option value="1">Основной</option>
          <option value="3">Поправки</option>
        </select>
      </div>
      <div className="form-row">
        <label htmlFor="ncen" className="form_label">
          NCEN
        </label>
        <input
          type="number"
          id="ncen"
          min={0}
          step={1}
          className="form_input"
          value={payment.ncen}
          onChange={(e) => setPayment({ ...payment, ncen: +e.target.value })}
        />
      </div>
      <div className="form-row">
        <label htmlFor="applied_rate_value" className="form_label">
          Применяемые тариф
        </label>
        <input
          type="number"
          id="applied_rate_value"
          className="form_input"
          value={payment.applied_rate_value}
          onChange={(e) => setPayment({...payment, applied_rate_value: e.target.value})}
        />
      </div>
      <div className="form-row">
        <label htmlFor="heating_value" className="form_label">
          Отопление/Гкал
        </label>
        <input
          type="number"
          id="heating_value"
          className="form_input"
          value={payment.heating_value}
          onChange={(e) =>
            setPayment({ ...payment, heating_value: e.target.value })
          }
        />
      </div>
      <div className="form-row">
        <label htmlFor="heating_cost" className="form_label">
          Отопление/Рубли
        </label>
        <input
          type="number"
          id="heating_cost"
          className="form_input"
          value={payment.heating_cost}
          onChange={(e) =>
            setPayment({ ...payment, heating_cost: e.target.value })
          }
        />
      </div>
      <div className="form-row">
        <label htmlFor="water_heating_value" className="form_label">
          ГВС/Гкал
        </label>
        <input
          type="number"
          id="water_heating_value"
          className="form_input"
          value={payment.water_heating_value}
          onChange={(e) =>
            setPayment({ ...payment, water_heating_value: e.target.value })
          }
        />
      </div>
      <div className="form-row">
        <label htmlFor="water_heating_cost" className="form_label">
          ГВС/Рубли
        </label>
        <input
          type="number"
          id="water_heating_cost"
          className="form_input"
          value={payment.water_heating_cost}
          onChange={(e) =>
            setPayment({ ...payment, water_heating_cost: e.target.value })
          }
        />
      </div>
      <div className="form-row">
        {selectedItem?.id ? (
          <Button text={"Обновить"} callback={() => onUpdate(payment)} />
        ) : (
          <Button text={"Добавить"} callback={() => onCreate(payment)} />
        )}
      </div>
    </React.Fragment>
  );
};

export default PaymentForm;
