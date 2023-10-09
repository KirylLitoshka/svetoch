import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Error from "../../ui/error/Error";
import FormWrapper from "../../wrappers/form/FormWrapper";

const BankForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const locationItem = location.state?.item;
  const [bank, setBank] = useState({ title: "", code: "" });
  const [error, setError] = useState("");

  const updateBank = async () => {
    axios.patch(`/api/v1/electricity/banks/${bank.id}`, bank).then((r) => {
      if (r.data.success) {
        navigate("/catalogues/banks")
      } else {
        setError(r.data.reason)
      }
    }).catch((e) => setError(e.response.data.reason))
  }

  const createBank = async () => {
    axios.post("/api/v1/electricity/banks", bank).then((r) => {
      if (r.data.success) {
        navigate("/catalogues/banks")
      } else {
        setError(r.data.reason)
      }
    }).catch((e) => setError(e.response.data.reason))
  }

  useEffect(() => {
    if (locationItem) {
      setBank(locationItem);
    }
  }, [locationItem]);

  if (error) {
    return <Error message={error} />;
  }
  return (
    <FormWrapper>
      <div className="form__row">
        <label htmlFor="title" className="form__label">
          Наименование
        </label>
        <input
          id="title"
          type="text"
          className="form__input"
          value={bank.title}
          onChange={(e) => setBank({ ...bank, title: e.target.value })}
        />
      </div>
      <div className="form__row">
        <label htmlFor="code" className="form__label">
          Код банка
        </label>
        <input
          id="code"
          type="text"
          className="form__input"
          value={bank.code}
          onChange={(e) => setBank({ ...bank, code: e.target.value })}
        />
      </div>
      <div className="form__row">
        {bank.id ? (
          <div className="form__button" onClick={updateBank}>
            Обновить
          </div>
        ) : (
          <div className="form__button" onClick={createBank}>
            Создать
          </div>
        )}
      </div>
    </FormWrapper>
  );
};

export default BankForm;