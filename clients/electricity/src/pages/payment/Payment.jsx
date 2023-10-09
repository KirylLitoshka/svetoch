import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../../components/ui/loader/Loader";
import PageTitle from "../../components/ui/title/PageTitle";
import Error from "../../components/ui/error/Error";
import ModalWrapper from "../../components/wrappers/modal/ModalWrapper";
import Notification from "../../components/ui/modals/notify/Notification";
import { useAreasObjects } from "../../hooks/useObjects";
import "./Payment.css";

const Payment = () => {
  const [loading, setLoading] = useState(true);
  const [objectLoading, setObjectsLoading] = useState(false);
  const [error, setError] = useState("");
  const [areas, setAreas] = useState([]);
  const [selectedAreaID, setSelectedAreaID] = useState(null);
  const [postData, setPostData] = useState([]);
  const [areasObjects, setAreasObjects] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState({ meterNumber: "" });
  const filteredAreasObjects = useAreasObjects(
    areasObjects,
    searchQuery.meterNumber
  );

  const postAction = async () => {
    axios.post('/api/v1/electricity/test', postData).then((r) => {
      console.log(r.data)
    })
  };

  const postPayments = async () => {
    if (postData.length === 0) {
      return;
    }
    if (modalVisible) {
      postAction();
    } else {
      for (const payment of postData) {
        const checkedObject = filteredAreasObjects.find(
          (obj) => obj.id === payment.id
        );
        if ((checkedObject.meter.last_reading || 0) > payment.last_reading) {
          setModalVisible(true);
          return;
        }
      }
      postAction();
    }
    setModalVisible(false);
  };

  const clearInputs = () => {
    const inputs = document.querySelectorAll(".payment_input");
    inputs.forEach((input) => (input.value = ""));
  };

  const lastReadingChangeHandler = (e, id) => {
    const lastReading = parseFloat(e.target.value) || null;
    const elemExists = postData.find((elem) => elem.id === id);
    if (elemExists && !lastReading) {
      if (elemExists.losses) {
        setPostData((prevState) =>
          prevState.map((item) =>
            item.id === id ? { id: item.id, losses: item.losses } : item
          )
        );
      } else {
        setPostData((prevState) => prevState.filter((item) => item.id !== id));
      }
    } else if (elemExists) {
      setPostData((prevState) =>
        prevState.map((item) =>
          item.id === id ? { ...item, last_reading: lastReading } : item
        )
      );
    } else {
      setPostData([...postData, { id: id, last_reading: lastReading }]);
    }
  };

  const loosesChangeHandler = (e, id) => {
    const objectLosses = parseFloat(e.target.value) || null;
    const objectItem = postData.find((elem) => elem.id === id);
    if (objectItem && !objectLosses) {
      if (objectItem.last_reading) {
        setPostData((prevState) =>
          prevState.map((item) =>
            item.id === id
              ? { id: item.id, last_reading: item.last_reading }
              : item
          )
        );
      } else {
        setPostData((prevState) => prevState.filter((item) => item.id !== id));
      }
    }
    if (objectItem) {
      setPostData((prevState) =>
        prevState.map((item) =>
          item.id === id ? { ...item, losses: objectLosses } : item
        )
      );
    } else {
      setPostData([...postData, { id: id, losses: objectLosses }]);
    }
  };

  console.log(postData);

  useEffect(() => {
    const getAreas = async () => {
      axios
        .get("/api/v1/electricity/areas")
        .then((r) => {
          if (r.data.success) {
            setAreas(r.data.items);
          } else {
            setError(r.data.reason);
          }
        })
        .catch((e) => setError(e.response.data.reason));
    };

    getAreas().then(() => setLoading(false));
  }, []);

  useEffect(() => {
    const getAreasObjects = async () => {
      axios
        .get("/api/v1/electricity/objects", {
          params: { area: selectedAreaID },
        })
        .then((r) => {
          if (r.data.success) {
            setAreasObjects(r.data.items);
          } else {
            setError(r.data.response);
          }
        })
        .catch((e) => setError(e.reponse.data.reason));
    };

    if (selectedAreaID) {
      clearInputs();
      setObjectsLoading(true);
      getAreasObjects()
        .then(() => setPostData([]))
        .then(() => setObjectsLoading(false));
    }
  }, [selectedAreaID]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <Error message={error} />;
  }

  return (
    <React.Fragment>
      <PageTitle>
        <label
          htmlFor="meter_number"
          style={{ fontSize: "17px", marginRight: "25px" }}
        >
          <input
            type="text"
            id="meter_number"
            placeholder="Номер счетчика"
            onChange={(e) => setSearchQuery({ meterNumber: e.target.value })}
          />
        </label>
        <select
          className="page-main__title_select"
          defaultValue={""}
          onChange={(e) => setSelectedAreaID(e.target.value)}
        >
          <option value="">Не указан</option>
          {areas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.title}
            </option>
          ))}
        </select>
      </PageTitle>
      {objectLoading ? (
        <Loader />
      ) : filteredAreasObjects.length && selectedAreaID ? (
        <div className="payment-list">
          <div className="payment-list__row">
            <div>Наименование</div>
            <div>Начальные показания</div>
            <div>Конечные показания</div>
            <div>Потери</div>
            <div>Расход</div>
          </div>
          {filteredAreasObjects.map((item, index) => (
            <div key={index} className="payment-list__row">
              <div>{item.title}</div>
              <div>
                {item.meter?.last_reading ? item.meter.last_reading : 0}
              </div>
              <div>
                <input
                  type="text"
                  className="payment_input"
                  onChange={(e) => lastReadingChangeHandler(e, item.id)}
                />
              </div>
              <div>
                <input
                  type="text"
                  className="payment_input"
                  onChange={(e) => loosesChangeHandler(e, item.id)}
                />
              </div>
              <div>
                {postData.find((elem) => elem.id === item.id)
                  ? (
                      postData.find((elem) => elem.id === item.id)
                        .last_reading - (item.meter?.last_reading || 0) || 0
                    ).toFixed(4)
                  : 0}
              </div>
            </div>
          ))}
          <div className="form__button" onClick={postPayments}>
            Отправить
          </div>
        </div>
      ) : (
        <Error message={"Укажите категорию"} />
      )}
      <ModalWrapper isVisible={modalVisible} setIsVisible={setModalVisible}>
        <Notification
          text={"В списке присутствуют отрицательные значения!\n\nПродолжить?"}
          onSubmitAction={postPayments}
          onCloseAction={setModalVisible}
        />
      </ModalWrapper>
    </React.Fragment>
  );
};

export default Payment;
