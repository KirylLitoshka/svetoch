import axios from "axios";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CatalogueWrapper from "../../components/wrappers/catalogue/CatalogueWrapper";
import Loader from "../../components/ui/loader/Loader";
import Error from "../../components/ui/error/Error";
import CatalogueItem from "../../components/items/catalogue/CatalogueItem";
import CatalogueControl from "../../components/ui/controls/catalogue/CatalogueControl";
import ControlButton from "../../components/ui/buttons/controls/ControlButton";
import ModalWrapper from "../../components/wrappers/modal/ModalWrapper";
import Confirm from "../../components/ui/modals/confirm/Confirm";
import PageTitle from "../../components/ui/title/PageTitle";
import UserDate from "../../components/ui/date/Date";

const Rates = () => {
  const [rates, setRates] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setLoading] = useState(true);
  const [selectedID, setSelectedID] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const getRates = async () => {
    axios
      .get("/api/v1/electricity/rates")
      .then((r) => {
        if (r.data.success) {
          setRates(r.data.items);
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .then(() => setLoading(false));
  };

  const deleteRates = async () => {
    axios
      .delete(`/api/v1/electricity/rates/${selectedID}`)
      .then((r) => {
        if (r.data.success) {
          setRates(rates.filter((rate) => rate.id !== selectedID));
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .then(() => setModalVisible(false));
  };

  useEffect(() => {
    getRates();
  }, []);

  if (isLoading) {
    return <Loader />;
  } else if (error) {
    return <Error message={error} />;
  }

  return (
    <React.Fragment>
      <PageTitle>
        <Link to="add" className="page-main__button">
          + Добавить
        </Link>
      </PageTitle>
      <CatalogueWrapper>
        {rates.map((rate) => (
          <CatalogueItem key={rate.id} title={rate.title}>
            <UserDate label="Дата установки" date={rate.entry_date} />
            <div>Тариф: {!rate.value ? "Не установлен" : rate.value}</div>
            <CatalogueControl>
            <ControlButton
                type="link"
                label="История"
                linkURL="history"
                linkState={{ itemID: rate.id }}
              />
              <ControlButton
                type="link"
                label="Изменить"
                linkURL="edit"
                linkState={{ item: rate }}
              />
              <ControlButton
                label={"Удалить"}
                type="button"
                callback={() => {
                  setSelectedID(rate.id);
                  setModalVisible(true);
                }}
              />
            </CatalogueControl>
          </CatalogueItem>
        ))}
      </CatalogueWrapper>
      <ModalWrapper isVisible={modalVisible} setIsVisible={setModalVisible}>
        <Confirm
          onConfirmAction={deleteRates}
          onCloseAction={setModalVisible}
        />
      </ModalWrapper>
    </React.Fragment>
  );
};

export default Rates;
