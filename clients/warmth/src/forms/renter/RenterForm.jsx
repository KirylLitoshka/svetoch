import React, { useEffect, useState } from "react";
import axios from "axios";
import Button from "../../components/ui/buttons/base/Button";
import ErrorMessage from "../../components/ui/messages/ErrorMessage";

const RenterForm = ({ selectedItem, onUpdate, onCreate }) => {
  const initial = {
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
    bank: null,
  };
  const [renter, setRenter] = useState(initial);
  const [banks, setBanks] = useState([]);
  const [error, setError] = useState("");

  const getBanks = async () => {
    axios
      .get("/api/v1/warmth/banks")
      .then((r) => {
        if (r.data.success) {
          setBanks(r.data.items);
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason));
  };

  useEffect(() => {
    if (selectedItem?.id) {
      setRenter(selectedItem);
    } else {
      setRenter(initial);
    }
  }, [selectedItem]);

  useState(() => {
    getBanks();
  }, []);

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <React.Fragment>
      <div className="form-row">
        <label className="form_label" htmlFor="short_name">
          Наименование
        </label>
        <input
          type="text"
          id="short_name"
          className="form_input"
          value={renter.name}
          onChange={(e) => setRenter({ ...renter, name: e.target.value })}
        />
      </div>
      <div className="form-row">
        <label htmlFor="full_name" className="form_label">
          Полное наименование
        </label>
        <input
          type="text"
          id="full_name"
          className="form_input"
          value={renter.full_name}
          onChange={(e) => setRenter({ ...renter, full_name: e.target.value })}
        />
      </div>
      <div className="form-row">
        <label htmlFor="bank" className="form_label">
          Банк
        </label>
        <select
          name=""
          id="bank"
          className="form_input"
          value={renter.bank_id || ""}
          onChange={(e) => {
            const bank = banks.find((bank) => bank.id === +e.target.value);
            setRenter({ ...renter, bank: bank, bank_id: bank.id });
          }}
        >
          <option value="" disabled>
            Не указан
          </option>
          {banks.map((bank) => (
            <option key={bank.id} value={bank.id}>
              {bank.title}
            </option>
          ))}
        </select>
      </div>
      <div className="form-row">
        <label htmlFor="checking_account" className="form_label">
          Расчетный счет
        </label>
        <input
          type="text"
          id="checking_account"
          className="form_input"
          value={renter.checking_account || ""}
          onChange={(e) =>
            setRenter({ ...renter, checking_account: e.target.value || null })
          }
        />
      </div>
      <div className="form-row">
        <label htmlFor="registration_number" className="form_label">
          УНП
        </label>
        <input
          type="text"
          id="registration_number"
          className="form_input"
          value={renter.registration_number || ""}
          onChange={(e) =>
            setRenter({
              ...renter,
              registration_number: e.target.value || null,
            })
          }
        />
      </div>
      <div className="form-row">
        <label htmlFor="respondent_number" className="form_label">
          ОКПО
        </label>
        <input
          type="text"
          id="respondent_number"
          className="form_input"
          value={renter.respondent_number || ""}
          onChange={(e) =>
            setRenter({ ...renter, respondent_number: e.target.value || null })
          }
        />
      </div>
      <div className="form-row">
        <label htmlFor="contract_number" className="form_label">
          Номер договора
        </label>
        <input
          type="text"
          id="contract_number"
          className="form_input"
          value={renter.contract_number || ""}
          onChange={(e) =>
            setRenter({ ...renter, contract_number: e.target.value || null })
          }
        />
      </div>
      <div className="form-row">
        <label htmlFor="contract_date" className="form_label">
          Дата заключения договора
        </label>
        <input
          type="date"
          name="contract_date"
          id="contract_date"
          className="form_input"
          value={renter.contract_date || ""}
          onChange={(e) =>
            setRenter({ ...renter, contract_date: e.target.value || null })
          }
        />
      </div>
      <div className="form-row">
        <label htmlFor="address" className="form_label">
          Адрес
        </label>
        <input
          type="text"
          id="address"
          className="form_input"
          value={renter.address || ""}
          onChange={(e) =>
            setRenter({ ...renter, address: e.target.value || null })
          }
        />
      </div>
      <div className="form-row">
        <label htmlFor="contacts" className="form_label">
          Контакты
        </label>
        <input
          type="text"
          id="contacts"
          className="form_input"
          value={renter.contacts || ""}
          onChange={(e) =>
            setRenter({ ...renter, contacts: e.target.value || null })
          }
        />
      </div>
      <div className="form-row">
        <label htmlFor="is_bank_payer" className="form_label">
          Требование в банк
        </label>
        <input
          type="checkbox"
          name="is_bank_payer"
          id="is_bank_payer"
          className="form_input"
          checked={renter.is_bank_payer}
          onChange={() =>
            setRenter({ ...renter, is_bank_payer: !renter.is_bank_payer })
          }
        />
      </div>
      <div className="form-row">
        <label htmlFor="is_public_sector" className="form_label">
          Бюджетная организация
        </label>
        <input
          type="checkbox"
          name="is_public_sector"
          id="is_public_sector"
          className="form_input"
          value={renter.is_public_sector}
          onChange={() =>
            setRenter({ ...renter, is_public_sector: !renter.is_public_sector })
          }
        />
      </div>
      <div className="form-row">
        <label htmlFor="is_closed" className="form_label">
          Закрытый
        </label>
        <input
          type="checkbox"
          name="is_closed"
          id="is_closed"
          className="form_input"
          value={renter.is_closed}
          onChange={() =>
            setRenter({ ...renter, is_closed: !renter.is_closed })
          }
        />
      </div>
      <div className="form-row">
        {selectedItem?.id ? (
          <Button text={"Обновить"} callback={() => onUpdate(renter)} />
        ) : (
          <Button text={"Добавить"} callback={() => onCreate(renter)} />
        )}
      </div>
    </React.Fragment>
  );
};

export default RenterForm;
