import React, { useState } from "react";
import Button from "../../components/ui/buttons/base/Button";

const RenterReport = ({callback}) => {
  const [reportType, setReportType] = useState("");

  return (
    <React.Fragment>
      <div className="form-row">
        <label htmlFor="type" className="form_label" style={{fontSize: "22px"}}>
          Тип отчета:
        </label>
        <select
          style={{fontSize: "20px"}}
          name="type"
          id="type"
          className="form_input"
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
        >
          <option value="" disabled>Не указан</option>
          <option value="renter_short">Сокращенный</option>
          <option value="renter_full">Полный</option>
          <option value="renter_invoice">Счет фактура</option>
          <option value="renter_bank">Платежные требования</option>
        </select>
      </div>
      <div className="form-row">
        <Button text={"Сформировать отчет"} callback={() => callback(reportType)} />
      </div>
    </React.Fragment>
  );
};

export default RenterReport;
