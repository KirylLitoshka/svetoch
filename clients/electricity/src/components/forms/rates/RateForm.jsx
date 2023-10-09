import axios from "axios";
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Error from "../../ui/error/Error";
import FormWrapper from "../../wrappers/form/FormWrapper";

const RateForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const stateItem = location.state?.item
  const [rate, setRate] = useState({ title: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (stateItem) {
      setRate({ id: stateItem.id, title: stateItem.title });
    }
  }, [stateItem]);

  const postRate = async () => {
    await axios
      .post(`/api/v1/electricity/rates`, rate)
      .then((r) => {
        if (r.data.success) {
          navigate("/catalogues/rates");
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason));
  };

  const updateRate = async () => {
    await axios
      .patch(`/api/v1/electricity/rates/${rate.id}`, rate)
      .then((r) => {
        if (r.data.success) {
          navigate("/catalogues/rates");
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason));
  };

  if (error) {
    return <Error message={error} />;
  }

  return (
    <FormWrapper>
      <div className="form__row">
        <label htmlFor="name" className="form__label">
          Наименование
        </label>
        <input
          type="text"
          className="form__input"
          name="name"
          value={rate.title}
          onChange={(e) => setRate({ ...rate, title: e.target.value })}
        />
      </div>
      <div className="form__row">
        {rate.id ? (
          <div className="form__button" onClick={updateRate}>
            Обновить
          </div>
        ) : (
          <div className="form__button" onClick={postRate}>
            Создать
          </div>
        )}
      </div>
    </FormWrapper>
  );
};

export default RateForm;
