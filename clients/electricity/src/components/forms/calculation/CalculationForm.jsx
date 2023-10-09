import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FormWrapper from "../../wrappers/form/FormWrapper";
import { months } from "../../../utils/date";
import axios from "axios";
import Error from "../../ui/error/Error";

const CalculationForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const item = location.state?.item;
  const [error, setError] = useState("");
  const [calculationItem, setCalculationItem] = useState({
    year: "",
    month: 0,
    factor_1: "",
    factor_2: "",
    working_hours: "",
    limit: "",
  });

  const updateCalculationData = async () => {
    axios
      .patch(
        `/api/v1/electricity/calculation/${calculationItem.id}`,
        calculationItem
      )
      .then((r) => {
        if (r.data.success) {
          navigate("/catalogues/calculations");
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason));
  };

  const createCalculationData = async () => {
    axios
      .post("/api/v1/electricity/calculations", calculationItem)
      .then((r) => {
        if (r.data.success) {
          navigate("/catalogues/calculations");
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason));
  };

  useEffect(() => {
    if (item) {
      setCalculationItem(item);
    }
  }, [item]);

  if (error) {
    return <Error message={error}/>
  }

  return (
    <FormWrapper>
      <div className="form__row">
        <label htmlFor="year" className="form__label">
          Год
        </label>
        <input
          type="number"
          className="form__input"
          id="year"
          required
          value={calculationItem.year}
          onChange={(e) =>
            setCalculationItem({
              ...calculationItem,
              year: parseInt(e.target.value) || null,
            })
          }
        />
      </div>
      <div className="form__row">
        <label htmlFor="month" className="form__label">
          Месяц
        </label>
        <select
          name="month"
          id="month"
          className="form__input"
          value={calculationItem.month || "default"}
          onChange={(e) =>
            setCalculationItem({
              ...calculationItem,
              month: parseInt(e.target.value),
            })
          }
        >
          <option disabled value={"default"}>
            Не указан
          </option>
          {months.map((month, index) => (
            <option key={index} value={index}>
              {month}
            </option>
          ))}
        </select>
      </div>
      <div className="form__row">
        <label htmlFor="factor_1" className="form__label">
          Коэффициент 1
        </label>
        <input
          type="number"
          className="form__input"
          id="factor_1"
          value={calculationItem.factor_1 || ""}
          onChange={(e) =>
            setCalculationItem({
              ...calculationItem,
              factor_1: parseFloat(e.target.value),
            })
          }
        />
      </div>
      <div className="form__row">
        <label htmlFor="factor_2" className="form__label">
          Коэффициент 2
        </label>
        <input
          type="number"
          className="form__input"
          id="factor_2"
          value={calculationItem.factor_2 || ""}
          onChange={(e) =>
            setCalculationItem({
              ...calculationItem,
              factor_2: parseFloat(e.target.value),
            })
          }
        />
      </div>
      <div className="form__row">
        <label htmlFor="working_hours" className="form__label">
          Количество часов
        </label>
        <input
          type="text"
          className="form__input"
          id="working_hours"
          value={calculationItem.working_hours || ""}
          onChange={(e) =>
            setCalculationItem({
              ...calculationItem,
              working_hours: parseInt(e.target.value) || null,
            })
          }
        />
      </div>
      <div className="form__row">
        <label htmlFor="limit" className="form__label">
          Лимиты
        </label>
        <input
          type="text"
          className="form__input"
          id="limit"
          value={calculationItem.limit || ""}
          onChange={(e) =>
            setCalculationItem({
              ...calculationItem,
              limit: parseInt(e.target.value) || null,
            })
          }
        />
      </div>
      <div className="form__row">
        {calculationItem.id ? (
          <div className="form__button" onClick={updateCalculationData}>
            Обновить
          </div>
        ) : (
          <div className="form__button" onClick={createCalculationData}>
            Создать
          </div>
        )}
      </div>
    </FormWrapper>
  );
};

export default CalculationForm;
