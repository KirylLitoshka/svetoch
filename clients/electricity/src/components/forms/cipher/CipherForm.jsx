import axios from "axios";
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FormWrapper from "../../wrappers/form/FormWrapper";
import Error from "../../ui/error/Error";
import Loader from "../../ui/loader/Loader";

const CiphersForm = () => {
  const location = useLocation();
  const stateItem = location.state?.item;
  const navigate = useNavigate();
  const [cipher, setCipher] = useState({ title: "", code: "", rate_id: null });
  const [rates, setRates] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const getRates = async () => {
    await axios
      .get("/api/v1/electricity/rates")
      .then((r) => {
        if (r.data.success) {
          setRates(r.data.items);
        } else {
          setError(r.data.reason)
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .then(() => setIsLoading(false));
  };

  const postCipher = async () => {
    await axios
      .post("/api/v1/electricity/ciphers", cipher)
      .then((r) => {
        if (r.data.success) {
          navigate("/catalogues/ciphers");
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason));
  };

  const patchCipher = async () => {
    await axios
      .patch(`/api/v1/electricity/ciphers/${cipher.id}`, cipher)
      .then((r) => {
        if (r.data.success) {
          navigate("/catalogues/ciphers");
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason));
  };

  useEffect(() => {
    if (stateItem) {
      setCipher({ ...stateItem });
    }
    getRates();
  }, [stateItem]);

  if (isLoading) {
    return <Loader />;
  } else if (error) {
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
          value={cipher.title}
          onChange={(e) => setCipher({ ...cipher, title: e.target.value })}
        />
      </div>
      <div className="form__row">
        <label htmlFor="code" className="form__label">
          Код
        </label>
        <input
          id="code"
          type="text"
          className="form__input"
          name="code"
          value={cipher.code}
          onChange={(e) => setCipher({ ...cipher, code: e.target.value })}
        />
      </div>
      <div className="form__row">
        <label htmlFor="rate_id" className="form__label">
          Тариф
        </label>
        <select
          name="rate_id"
          id="rate_id"
          className="form__input"
          defaultValue={cipher.rate_id || "default"}
          onChange={(e) =>
            setCipher({ ...cipher, rate_id: parseInt(e.target.value) || null })
          }
        >
          <option value="default">
            Не указан
          </option>
          {rates.map((rate) => (
            <option key={rate.id} value={rate.id}>
              {rate.title} ({rate.value})
            </option>
          ))}
        </select>
      </div>
      <div className="form__row">
        {cipher.id ? (
          <div className="form__button" onClick={patchCipher}>
            Обновить
          </div>
        ) : (
          <div className="form__button" onClick={postCipher}>
            Создать
          </div>
        )}
      </div>
    </FormWrapper>
  );
};

export default CiphersForm;
