import React, { useEffect, useState } from "react";
import axios from "axios";
import ErrorMessage from "../../components/ui/messages/ErrorMessage";
import Loader from "../../components/ui/loader/Loader";
import Button from "../../components/ui/buttons/base/Button";

const ObjectForm = ({ selectedItem, onCreate, onUpdate }) => {
  const [objectItem, setObjectItem] = useState({
    title: "",
    code: null,
    rate: null,
    workshop: null,
    reconciliation_code: null,
    is_closed: false,
    is_meter_unavailable: false,
    is_heating_available: false,
    heating_load: null,
    is_water_heating_available: false,
    water_heating_load: null,
    vat: 0,
  });
  const [workshops, setWorkshops] = useState([]);
  const [rates, setRates] = useState([]);
  const [reconciliationCodes, setReconciliationCodes] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedItem?.id) {
      setObjectItem({ ...selectedItem });
    } else {
      setObjectItem({
        title: "",
        code: "",
        rate: null,
        workshop: null,
        reconciliation_code: null,
        is_closed: false,
        is_meter_unavailable: false,
        vat: 0,
      });
    }
  }, [selectedItem]);

  useEffect(() => {
    const urls = [
      "/api/v1/warmth/rates",
      "/api/v1/warmth/workshops",
      "/api/v1/warmth/reconciliation_codes",
    ];
    const requests = urls.map((url) => axios.get(url));

    axios
      .all(requests)
      .then(
        axios.spread((...responses) => {
          const statuses = responses.map((response) => response.data.success);
          if (statuses.includes(false)) {
            const errorResponses = responses.filter((res) => !res.data.success);
            const reasons = errorResponses.map(
              (resp) => `Error at ${resp.config.url}: ${resp.data.reason}`
            );
            setError(reasons.join("\n"));
          } else {
            setRates(responses[0].data.items);
            setWorkshops(responses[1].data.items);
            setReconciliationCodes(responses[2].data.items);
          }
        })
      )
      .then(() => setLoading(false));
  }, []);

  if (error) {
    <ErrorMessage message={error} />;
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <React.Fragment>
      <div className="form-row">
        <label htmlFor="title" className="form_label">
          Наименование
        </label>
        <input
          id="title"
          className="form_input"
          type="text"
          value={objectItem.title}
          onChange={(e) =>
            setObjectItem({ ...objectItem, title: e.target.value })
          }
        />
      </div>
      <div className="form-row">
        <label htmlFor="code" className="form_label">
          Код
        </label>
        <input
          id="code"
          className="form_input"
          type="number"
          value={objectItem.code || ""}
          onChange={(e) =>
            setObjectItem({
              ...objectItem,
              code: parseInt(e.target.value) || null,
            })
          }
        />
      </div>
      <div className="form-row">
        <label htmlFor="rate" className="form_label">
          Тариф
        </label>
        <select
          name="rate"
          id="rate"
          className="form_input"
          value={objectItem.rate?.id || ""}
          onChange={(e) =>
            setObjectItem({
              ...objectItem,
              rate: rates.find((item) => item.id === +e.target.value),
            })
          }
        >
          <option value={""} disabled>
            Не указан
          </option>
          {rates.map((rate) => (
            <option key={rate.id} value={rate.id}>
              {rate.title}
            </option>
          ))}
        </select>
      </div>
      <div className="form-row">
        <label htmlFor="workshop" className="form_label">
          Цех
        </label>
        <select
          name="workshop"
          id="workshop"
          className="form_input"
          value={objectItem.workshop?.id || ""}
          onChange={(e) => {
            setObjectItem({
              ...objectItem,
              workshop: workshops.find((item) => item.id === +e.target.value),
            });
          }}
        >
          <option disabled value={""}>
            Не указан
          </option>
          {workshops.map((workshop) => (
            <option key={workshop.id} value={workshop.id}>
              {workshop.title}
            </option>
          ))}
        </select>
      </div>
      <div className="form-row">
        <label htmlFor="reconciliation_code" className="form_label">
          Код сверки
        </label>
        <select
          name="reconciliation_code"
          id="reconciliation_code"
          className="form_input"
          value={objectItem.reconciliation_code?.id || ""}
          onChange={(e) => {
            setObjectItem({
              ...objectItem,
              reconciliation_code: reconciliationCodes.find(
                (item) => item.id === +e.target.value
              ),
            });
          }}
        >
          <option disabled value="">
            Не указан
          </option>
          {reconciliationCodes.map((code) => (
            <option key={code.id} value={code.id}>
              {code.title}
            </option>
          ))}
        </select>
      </div>
      <div className="form-row">
        <label htmlFor="is_closed" className="form_label">
          Закрытый объект
        </label>
        <input
          id="is_closed"
          type="checkbox"
          className="form_input"
          checked={objectItem.is_closed}
          onChange={() =>
            setObjectItem({ ...objectItem, is_closed: !objectItem.is_closed })
          }
        />
      </div>
      <div className="form-row">
        <label htmlFor="is_meter_unavailable" className="form_label">
          Без прибора
        </label>
        <input
          type="checkbox"
          id="is_meter_unavailable"
          className="form_input"
          value={objectItem.is_meter_unavailable}
          onChange={() =>
            setObjectItem({
              ...objectItem,
              is_meter_unavailable: !objectItem.is_meter_unavailable,
            })
          }
        />
      </div>
      <div className="form-row">
        <label htmlFor="is_heating_available" className="form_label">
          Отопление
        </label>
        <input
          type="checkbox"
          className="form_input"
          id="is_heating_available"
          checked={objectItem.is_heating_available}
          onChange={() => {
            if (objectItem.is_heating_available) {
              setObjectItem({
                ...objectItem,
                is_heating_available: !objectItem.is_heating_available,
                heating_load: null,
              });
            } else {
              setObjectItem({
                ...objectItem,
                is_heating_available: !objectItem.is_heating_available,
              });
            }
          }}
        />
      </div>
      {objectItem.is_heating_available && (
        <div className="form-row">
          <label htmlFor="heating_load" className="form_label">
            Нагрузка отопления
          </label>
          <input
            type="number"
            name="heating_load"
            id="heating_load"
            className="form_input"
            value={objectItem.heating_load || ""}
            onChange={(e) =>
              setObjectItem({ ...objectItem, heating_load: e.target.value || null })
            }
          />
        </div>
      )}
      <div className="form-row">
        <label htmlFor="is_water_heating_available" className="form_label">
          ГВС
        </label>
        <input
          type="checkbox"
          name="is_water_heating_available"
          id="is_water_heating_available"
          className="form_input"
          checked={objectItem.is_water_heating_available}
          onChange={() => {
            if (objectItem.is_water_heating_available) {
              setObjectItem({
                ...objectItem,
                water_heating_load: null,
                is_water_heating_available: !objectItem.is_water_heating_available,
              });
            } else {
              setObjectItem({
                ...objectItem,
                is_water_heating_available: !objectItem.is_water_heating_available,
              });
            }
          }}
        />
      </div>
      {objectItem.is_water_heating_available && (
        <div className="form-row">
          <label htmlFor="water_heating_load" className="form_label">
            Нагрузка ГВС
          </label>
          <input
            type="number"
            name="water_heating_load"
            id="water_heating_load"
            className="form_input"
            value={objectItem.water_heating_load || ""}
            onChange={(e) =>
              setObjectItem({
                ...objectItem,
                water_heating_load: e.target.value || null,
              })
            }
          />
        </div>
      )}
      <div className="form-row">
        <label htmlFor="vat" className="form_label">
          НДС
        </label>
        <input
          type="number"
          id="vat"
          className="form_input"
          value={objectItem.vat || ""}
          onChange={(e) =>
            setObjectItem({ ...objectItem, vat: parseInt(e.target.value) || 0 })
          }
        />
      </div>
      <div className="form-row">
        {selectedItem?.id ? (
          <Button text={"Обновить"} callback={() => onUpdate(objectItem)} />
        ) : (
          <Button text={"Добавить"} callback={() => onCreate(objectItem)} />
        )}
      </div>
    </React.Fragment>
  );
};

export default ObjectForm;
