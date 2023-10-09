import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FormWrapper from "../../wrappers/form/FormWrapper";
import { getCurrentDate } from "../../../utils/date";
import Loader from "../../ui/loader/Loader";
import Error from "../../ui/error/Error";
import axios from "axios";

const RatesHistoryForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const rateID = location.state?.rateID;
  const historyItem = location.state?.item;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rateHistoryItem, setRateHistoryItem] = useState({
    rate_id: rateID,
    value: 0,
    entry_date: getCurrentDate(),
  });

  console.log(rateID)

  const updateRateHistory = async () => {
    axios
      .patch(
        `/api/v1/electricity/rates/${rateID}/history/${historyItem.id}`,
        rateHistoryItem
      )
      .then((r) => {
        if (r.data.success) {
          navigate("/catalogues/rates/history", { state: { itemID: rateID } });
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.success));
  };

  const createRateHistory = async () => {
    axios
      .post(`/api/v1/electricity/rates/${rateID}/history`, rateHistoryItem)
      .then((r) => {
        if (r.data.success) {
          navigate("/catalogues/rates/history", { state: { itemID: rateID } });
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.success));
  };

  useEffect(() => {
    if (historyItem) {
      setRateHistoryItem(historyItem);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <Error message={error} />;
  }

  return (
    <FormWrapper>
      <div className="form__row">
        <label htmlFor="value" className="form__label">
          Значение
        </label>
        <input
          id="value"
          type="text"
          className="form__input"
          value={rateHistoryItem.value}
          onChange={(e) =>
            setRateHistoryItem({
              ...rateHistoryItem,
              value: parseFloat(e.target.value) || null,
            })
          }
        />
      </div>
      <div className="form__row">
        <label htmlFor="entry_date" className="form__label">
          Дата установки тарифа
        </label>
        <input
          type="date"
          id="entry_date"
          className="form__input"
          value={rateHistoryItem.entry_date}
          required
          onChange={(e) =>
            setRateHistoryItem({
              ...rateHistoryItem,
              entry_date: e.target.value,
            })
          }
        />
      </div>
      <div className="form__row">
        {historyItem?.id ? (
          <div className="form__button" onClick={updateRateHistory}>
            Обновить
          </div>
        ) : (
          <div className="form__button" onClick={createRateHistory}>
            Создать
          </div>
        )}
      </div>
    </FormWrapper>
  );
};

export default RatesHistoryForm;
