import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Loader from "../../ui/loader/Loader";
import Error from "../../ui/error/Error";
import FormWrapper from "../../wrappers/form/FormWrapper";
import axios from "axios";

const LimitForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationItem = location.state?.item;
  const [limit, setLimit] = useState({ title: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const createLimit = async () => {
    axios
      .post("/api/v1/electricity/limits", limit)
      .then((r) => {
        if (r.data.success) {
          navigate("/limits");
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.reponse.data.reason));
  };

  const updateLimit = async () => {
    axios
      .patch(`api/v1/electricity/limits/${limit.id}`, limit)
      .then((r) => {
        if (r.data.success) {
          navigate("/limits");
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.response));
  };

  useEffect(() => {
    if (locationItem) {
      setLimit(locationItem);
    }
    setLoading(false);
  }, [locationItem]);

  if (loading) {
    return <Loader />;
  }
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
          value={limit.title}
          className="form__input"
          onChange={(e) => setLimit({ ...limit, title: e.target.value })}
        />
      </div>
      <div className="form__row">
        {limit.id ? (
          <div className="form__button" onClick={updateLimit}>
            Обновить
          </div>
        ) : (
          <div className="form__button" onClick={createLimit}>
            Создать
          </div>
        )}
      </div>
    </FormWrapper>
  );
};

export default LimitForm;
