import React, { useEffect, useState } from "react";
import { months } from "../../utils/date";
import Button from "../../components/ui/buttons/base/Button";

const ApplicationForm = ({ appInfo, updateAppInfo, setVisible }) => {
  const [newDate, setNewDate] = useState({
    month: "",
    year: "",
  });

  useEffect(() => {
    setNewDate({
      month: appInfo.month,
      year: appInfo.year,
    });
  }, [appInfo]);

  return (
    <React.Fragment>
      <div className="form-row">
        <label htmlFor="month" className="form_label">
          Месяц:
        </label>
        <select
          value={newDate.month}
          className="form_input"
          name="month"
          id="month"
          onChange={(e) => setNewDate({ ...newDate, month: +e.target.value })}
        >
          {months.map((item, index) => (
            <option key={index} value={index + 1}>
              {item}
            </option>
          ))}
        </select>
      </div>
      <div className="form-row">
        <label htmlFor="year" className="form_label">
          Год
        </label>
        <input
          value={newDate.year}
          type="number"
          step={1}
          id="year"
          className="form_input"
          onChange={(e) => setNewDate({ ...newDate, year: +e.target.value })}
        />
      </div>
      <div className="form-row">
        <Button
          text={"Обновить"}
          callback={() => {
            updateAppInfo(newDate);
            setVisible(false);
          }}
        />
      </div>
    </React.Fragment>
  );
};

export default ApplicationForm;
