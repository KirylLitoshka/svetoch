import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Loader from "../../ui/loader/Loader";
import Error from "../../ui/error/Error";
import FormWrapper from "../../wrappers/form/FormWrapper";
import { getCurrentDate } from "../../../utils/date";

const RenterForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationItem = location.state?.item;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [banks, setBanks] = useState([]);
  const [renter, setRenter] = useState({
    name: "",
    full_name: "",
    bank_id: null,
    checking_account: null,
    registration_number: null,
    respondent_number: null,
    contract_number: null,
    contract_date: null,
    is_bank_payer: false,
    address: null,
    contacts: null,
    is_public_sector: false,
    is_closed: false,
  });

  const updateRenter = async () => {
    axios
      .patch(`/api/v1/electricity/renters/${renter.id}`, renter)
      .then((r) => {
        if (r.data.success) {
          navigate("/renters");
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason));
  };

  const postRenter = async () => {
    axios
      .post(`/api/v1/electricity/renters`, renter)
      .then((r) => {
        if (r.data.success) {
          navigate("/renters");
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason));
  };

  useEffect(() => {
    axios
      .get("/api/v1/electricity/banks")
      .then((r) => {
        if (r.data.success) {
          setBanks(r.data.items);
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .then(() => setLoading(false));

    if (locationItem) {
      setRenter(locationItem);
    }
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
        <label htmlFor="name" className="form__label">
          Наименование
        </label>
        <input
          type="text"
          id="name"
          className="form__input"
          value={renter.name}
          onChange={(e) => setRenter({ ...renter, name: e.target.value })}
        />
      </div>
      <div className="form__row">
        <label htmlFor="full_name" className="form__label">
          Полное наименование
        </label>
        <input
          type="text"
          id="full_name"
          className="form__input"
          value={renter.full_name}
          onChange={(e) => setRenter({ ...renter, full_name: e.target.value })}
        />
      </div>
      <div className="form__row">
        <label htmlFor="bank_id" className="form__label">
          Банк
        </label>
        <select
          name="bank_id"
          id="bank_id"
          className="form__input"
          defaultValue={renter.bank_id || "default"}
          onChange={(e) =>
            setRenter({
              ...renter,
              bank_id: parseInt(e.target.value) || null,
            })
          }
        >
          <option value="default">Не указан</option>
          {banks.map((bank) => (
            <option key={bank.id} value={bank.id}>
              {bank.title} - {bank.code}
            </option>
          ))}
        </select>
      </div>
      <div className="form__row">
        <label htmlFor="checking_account" className="form__label">
          Расчетный счет
        </label>
        <input
          type="text"
          id="checking_account"
          className="form__input"
          value={renter.checking_account || ""}
          onChange={(e) =>
            setRenter({ ...renter, checking_account: e.target.value || null })
          }
        />
      </div>
      <div className="form__row">
        <label htmlFor="registration_number" className="form__label">
          УНП
        </label>
        <input
          type="text"
          className="form__input"
          id="registration_number"
          value={renter.registration_number || ""}
          onChange={(e) =>
            setRenter({
              ...renter,
              registration_number: e.target.value || null,
            })
          }
        />
      </div>
      <div className="form__row">
        <label htmlFor="respondent_number" className="form__label">
          ОКПО
        </label>
        <input
          type="text"
          id="respondent_number"
          className="form__input"
          value={renter.respondent_number || ""}
          onChange={(e) =>
            setRenter({ ...renter, respondent_number: e.target.value || null })
          }
        />
      </div>
      <div className="form__row">
        <label htmlFor="contract_number" className="form__label">
          Номер договора
        </label>
        <input
          type="text"
          className="form__input"
          id="contract_number"
          value={renter.contract_number || ""}
          onChange={(e) =>
            setRenter({ ...renter, contract_number: e.target.value || null })
          }
        />
      </div>
      <div className="form__row">
        <label htmlFor="contract_date" className="form__label">
          Дата заключения договора
        </label>
        <input
          type="date"
          id="contract_date"
          className="form__input"
          value={renter.contract_date || getCurrentDate()}
          onChange={(e) =>
            setRenter({ ...renter, contract_date: e.target.value || null })
          }
        />
      </div>
      <div className="form__row">
        <label htmlFor="is_bank_payer" className="form__label">
          Плательщик в банк
        </label>
        <input
          type="checkbox"
          className="form__input"
          id="is_bank_payer"
          checked={renter.is_bank_payer}
          onChange={() =>
            setRenter({ ...renter, is_bank_payer: !renter.is_bank_payer })
          }
        />
      </div>
      <div className="form__row">
        <label htmlFor="address" className="form__label">
          Адрес
        </label>
        <input
          type="text"
          className="form__input"
          id="address"
          value={renter.address || ""}
          onChange={(e) =>
            setRenter({ ...renter, address: e.target.value || null })
          }
        />
      </div>
      <div className="form__row">
        <label htmlFor="contacts" className="form__label">
          Контакты
        </label>
        <input
          type="text"
          className="form__input"
          id="contacts"
          value={renter.contacts || ""}
          onChange={(e) =>
            setRenter({ ...renter, contacts: e.target.value || null })
          }
        />
      </div>
      <div className="form__row">
        <label htmlFor="is_public_sector" className="form__label">
          Бюджетная организация
        </label>
        <input
          type="checkbox"
          id="is_public_sector"
          className="form__input"
          checked={renter.is_public_sector}
          onChange={() =>
            setRenter({ ...renter, is_public_sector: !renter.is_public_sector })
          }
        />
      </div>
      <div className="form__row">
        <label htmlFor="is_closed" className="form__label">
          Закрытый арендатор
        </label>
        <input
          type="checkbox"
          id="is_closed"
          className="form__input"
          checked={renter.is_closed}
          onChange={() =>
            setRenter({ ...renter, is_closed: !renter.is_closed })
          }
        />
      </div>
      <div className="form__row">
        {renter.id ? (
          <div className="form__button" onClick={updateRenter}>
            Обновить
          </div>
        ) : (
          <div className="form__button" onClick={postRenter}>
            Создать
          </div>
        )}
      </div>
    </FormWrapper>
  );
};

export default RenterForm;
