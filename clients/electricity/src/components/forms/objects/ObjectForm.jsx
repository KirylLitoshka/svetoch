import React from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { isObjectsEqual } from "../../../utils/compares";
import Loader from "../../ui/loader/Loader";
import Error from "../../ui/error/Error";
import FormWrapper from "../../wrappers/form/FormWrapper";
import {
  addressToString,
  compareAddress,
  defaultAddressValue,
} from "../../../utils/addresses";

const ObjectForm = () => {
  const location = useLocation();
  const locationItemID = location.state?.id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const initialMeter = {
    meter_id: null,
    number: null,
    installation_date: null,
    last_reading: 0.0,
    heating_percentage: 0.0,
  };
  const [objectMeter, setObjectMeter] = useState(initialMeter);
  const [objectItem, setObjectItem] = useState({
    title: "",
    cipher_id: null,
    area_id: null,
    address_id: null,
    subscriber_type: 0,
    is_closed: false,
    counting_point: null,
    jeu_code: null,
    house_number: null,
    ee: 0,
  });

  const [meters, setMeters] = useState([]);
  const [areas, setAreas] = useState([]);
  const [ciphers, setCiphers] = useState([]);
  const [addresses, setAddresses] = useState([]);

  const postObjectItem = async () => {
    return await axios
      .post("/api/v1/electricity/objects", objectItem)
      .then((r) => {
        if (r.data.success) {
          return r.data.item.id;
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason));
  };

  const postObjectMeter = async (id) => {
    await axios
      .post(`/api/v1/electricity/objects/${id}/meters`, objectMeter)
      .then((r) => {
        if (!r.data.success) {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason));
  };

  const postItems = async () => {
    postObjectItem()
      .then((id) => {
        console.log(id)
        if (!error) {
          if (isObjectsEqual(objectMeter, initialMeter)) {
            navigate("/objects");
          } else {
            postObjectMeter(id);
          }
        }
      })
      .then(() => {
        if (!error) {
          navigate("/objects");
        }
      });
  };

  const updateObject = async () => {
    await axios
      .patch(`/api/v1/electricity/objects/${objectItem.id}`, objectItem)
      .then((r) => {
        if (!r.data.response) {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason));
  };

  const updateObjectMeter = async () => {
    await axios
      .patch(
        `/api/v1/electricity/objects/${objectItem.id}/meters/${objectMeter.id}`,
        objectMeter
      )
      .then((r) => {
        if (!r.data.success) {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason));
  };

  const updateItems = async () => {

    updateObject()
      .then(() => {
        if (objectMeter.id) {
          updateObjectMeter();
        } else if (isObjectsEqual(objectMeter, initialMeter)) {
          navigate("/objects");
        } else {
          postObjectMeter(objectItem.id);
        }
      })
      .then(() => navigate("/objects"));
  };

  useEffect(() => {
    const getObject = async () => {
      return axios
        .get(`/api/v1/electricity/objects/${locationItemID}`)
        .then((r) => {
          if (r.data.success) {
            setObjectItem(r.data.item);
          } else {
            setError(r.data.reason);
          }
        })
        .catch((e) => setError(e.response.data.reason));
    };

    const getObjectMeter = async () => {
      return axios
        .get(`/api/v1/electricity/objects/${locationItemID}/meters/current`)
        .then((r) => {
          if (r.data.success) {
            setObjectMeter(r.data.item);
          } else if (r.data.reason !== "Не найдено") {
            setError(r.data.reason);
          }
        })
        .catch((e) => setError(e.response.data.reason));
    };

    const fetchUrlsData = async () => {
      const urls = [
        "/api/v1/electricity/areas",
        "/api/v1/electricity/ciphers",
        "/api/v1/electricity/meters",
        "/api/v1/electricity/addresses",
      ];

      const requests = urls.map((url) => axios.get(url));

      return axios
        .all(requests)
        .then(
          axios.spread((...responses) => {
            const statuses = responses.map((response) => response.data.success);
            if (statuses.includes(false)) {
              const errorResponses = responses.filter(
                (res) => !res.data.success
              );
              const reasons = errorResponses.map(
                (resp) => `Error at ${resp.config.url}: ${resp.data.reason}`
              );
              setError(reasons.join("\n"));
            } else {
              setAreas(responses[0].data.items);
              setCiphers(responses[1].data.items);
              setMeters(responses[2].data.items);
              setAddresses(responses[3].data.items);
            }
          })
        )
        .catch((errors) => console.log(errors));
    };

    const promises = [fetchUrlsData()];

    if (locationItemID) {
      promises.push(getObject(), getObjectMeter());
    }

    Promise.all(promises).then(() => setLoading(false));
  }, [locationItemID]);

  const setAddressID = (e) => {
    const selectedAddress = addresses.filter((item) =>
      compareAddress(item, e.target.value)
    );
    if (selectedAddress[0]) {
      setObjectItem({ ...objectItem, address_id: selectedAddress[0].id });
    } else {
      setObjectItem({ ...objectItem, address_id: null });
    }
  };

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
          className="form__input"
          required
          value={objectItem.title}
          onChange={(e) =>
            setObjectItem({ ...objectItem, title: e.target.value })
          }
        />
      </div>
      <div className="form__row">
        <label htmlFor="cipher" className="form__label">
          Шифр
        </label>
        <select
          name="cipher"
          id="cipher"
          className="form__input"
          defaultValue={objectItem.cipher_id || "default"}
          onChange={(e) =>
            setObjectItem({
              ...objectItem,
              cipher_id: parseInt(e.target.value) || null,
            })
          }
        >
          <option value="default">Не указан</option>
          {ciphers.map((cipher) => (
            <option key={cipher.id} value={cipher.id}>
              {cipher.title} ({cipher.code})
            </option>
          ))}
        </select>
      </div>
      <div className="form__row">
        <label htmlFor="area" className="form__label">
          Участок
        </label>
        <select
          name="area"
          id="area"
          className="form__input"
          defaultValue={objectItem.area_id || "default"}
          onChange={(e) =>
            setObjectItem({
              ...objectItem,
              area_id: parseInt(e.target.value) || null,
            })
          }
        >
          <option value="default">Не указан</option>
          {areas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.title}
            </option>
          ))}
        </select>
      </div>
      {objectItem.id && (
        <div className="form__row">
          <label htmlFor="closed" className="form__label">
            Закрыть обьект?
          </label>
          <input
            id="closed"
            type="checkbox"
            className="form__input"
            checked={objectItem.is_closed}
            onChange={() =>
              setObjectItem({ ...objectItem, is_closed: !objectItem.is_closed })
            }
          />
        </div>
      )}
      <div className="form__row">
        <label htmlFor="sub_type" className="form__label">
          Вид абонента (хз что это)
        </label>
        <input
          type="number"
          id="sub_type"
          className="form__input"
          value={objectItem.subscriber_type}
          onChange={(e) =>
            setObjectItem({
              ...objectItem,
              subscriber_type: parseInt(e.target.value) || 0,
            })
          }
        />
      </div>
      <div className="form__row">
        <label htmlFor="counting_point" className="form__label">
          Точка учета
        </label>
        <input
          type="number"
          className="form__input"
          name="counting_point"
          id="counting_point"
          value={objectItem.counting_point || 0}
          onChange={(e) =>
            setObjectItem({
              ...objectItem,
              counting_point: parseInt(e.target.value) || null,
            })
          }
        />
      </div>
      <div className="form__row">
        <label htmlFor="ee" className="form__label">
          Vn
        </label>
        <input
          type="text"
          id="ee"
          className="form__input"
          value={objectItem.ee}
          onChange={(e) =>
            setObjectItem({ ...objectItem, ee: parseInt(e.target.value) })
          }
        />
      </div>
      <div className="form__row">
        <label htmlFor="meter" className="form__label">
          Счетчик
        </label>
        <select
          name="meter"
          id="meter"
          className="form__input"
          defaultValue={objectMeter.meter_id || "default"}
          onChange={(e) =>
            setObjectMeter({
              ...objectMeter,
              meter_id: parseInt(e.target.value) || null,
            })
          }
        >
          <option value="default">Не указан</option>
          {meters.map((meter) => (
            <option key={meter.id} value={meter.id}>
              {meter.title} ({meter.capacity})
            </option>
          ))}
        </select>
      </div>
      <div className="form__row">
        <label htmlFor="meter_number" className="form__label">
          Номер счетчика
        </label>
        <input
          type="text"
          id="meter_number"
          className="form__input"
          value={objectMeter.number || ""}
          onChange={(e) =>
            setObjectMeter({ ...objectMeter, number: e.target.value })
          }
        />
      </div>
      <div className="form__row">
        <label htmlFor="reading" className="form__label">
          Последние показания
        </label>
        <input
          type="number"
          name="last_reading"
          id="reading"
          className="form__input"
          value={objectMeter.last_reading}
          onChange={(e) =>
            setObjectMeter({
              ...objectMeter,
              last_reading: parseFloat(e.target.value) || 0,
            })
          }
        />
      </div>
      <div className="form__row">
        <label htmlFor="heating" className="form__label">
          Процент отопления
        </label>
        <input
          type="number"
          name="heating"
          id="heating"
          className="form__input"
          value={objectMeter.heating_percentage}
          onChange={(e) =>
            setObjectMeter({
              ...objectMeter,
              heating_percentage: parseFloat(e.target.value),
            })
          }
        />
      </div>
      <div className="form__row">
        <label htmlFor="installation_date" className="form__label">
          Дата установки
        </label>
        <input
          type="date"
          name="installation_date"
          id="installation_date"
          className="form__input"
          value={objectMeter.installation_date || ""}
          onChange={(e) =>
            setObjectMeter({
              ...objectMeter,
              installation_date: e.target.value || null,
            })
          }
        />
      </div>
      <div className="form__row">
        <label htmlFor="jeu_code" className="form__label">
          Код ЖЭУ
        </label>
        <input
          type="text"
          className="form__input"
          id="jeu_code"
          value={objectItem.jeu_code || ""}
          onChange={(e) =>
            setObjectItem({ ...objectItem, jeu_code: e.target.value || null })
          }
        />
      </div>
      <div className="form__row">
        <label htmlFor="addressLabel" className="form__label">
          Адрес
        </label>
        <input
          type="text"
          id="addressLabel"
          name="address"
          list="address"
          className="form__input"
          autoComplete="false"
          onChange={setAddressID}
          defaultValue={
            defaultAddressValue(addresses, objectItem.address_id) || ""
          }
        />
        <datalist id="address">
          {addresses.map((item) => (
            <option key={item.id} value={addressToString(item)} />
          ))}
        </datalist>
      </div>
      <div className="form__row">
        <label htmlFor="house_number" className="form__label">Номер дома</label>
        <input
          type="text"
          id="house_number"
          className="form__input"
          value={objectItem.house_number || ""}
          onChange={(e) =>
            setObjectItem({
              ...objectItem,
              house_number: e.target.value || null,
            })
          }
        />
      </div>
      <div className="form__row">
        {objectItem.id ? (
          <div className="form__button" onClick={updateItems}>
            Обновить
          </div>
        ) : (
          <div className="form__button" onClick={postItems}>
            Создать
          </div>
        )}
      </div>
    </FormWrapper>
  );
};

export default ObjectForm;
