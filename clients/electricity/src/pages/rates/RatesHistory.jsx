import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import PageTitle from "../../components/ui/title/PageTitle";
import CatalogueWrapper from "../../components/wrappers/catalogue/CatalogueWrapper";
import axios from "axios";
import CatalogueItem from "../../components/items/catalogue/CatalogueItem";
import UserDate from "../../components/ui/date/Date";
import ControlButton from "../../components/ui/buttons/controls/ControlButton";
import ModalWrapper from "../../components/wrappers/modal/ModalWrapper";
import Confirm from "../../components/ui/modals/confirm/Confirm";
import CatalogueControl from "../../components/ui/controls/catalogue/CatalogueControl";
import Loader from "../../components/ui/loader/Loader";
import Error from "../../components/ui/error/Error";

const RatesHistory = () => {
  const location = useLocation();
  const rateID = location.state?.itemID;
  const [rateItems, setRateItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedID, setSelectedID] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  console.log(location)

  const deleteRateItem = async () => {
    axios
      .delete(`/api/v1/electricity/rates/${rateID}/history/${selectedID}`)
      .then((r) => {
        if (r.data.success) {
          setRateItems(rateItems.filter((item) => item.id !== selectedID));
          setModalVisible(false)
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason));
  };

  useEffect(() => {
    const getItems = async () => {
      axios
        .get(`/api/v1/electricity/rates/${rateID}/history`)
        .then((r) => {
          if (r.data.success) {
            setRateItems(r.data.items);
          } else {
            setError(r.data.reason);
          }
        })
        .then(() => setLoading(false))
        .catch((e) => setError(e.response.data.reason));
    };

    if (rateID) {
      getItems();
    }
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <Error message={error} />;
  }

  return (
    <React.Fragment>
      <PageTitle>
        <Link to="add" className="page-main__button" state={{rateID: rateID}} >
          + Добавить
        </Link>
      </PageTitle>
      <CatalogueWrapper>
        {rateItems.map((item) => (
          <CatalogueItem key={item.id}>
            <UserDate label="Дата установки" date={item.entry_date} />
            <div>Тариф: {!item.value ? "Не установлен" : item.value}</div>
            <CatalogueControl>
              <ControlButton
                type="link"
                label="Изменить"
                linkURL="edit"
                linkState={{ item: item, rateID: rateID }}
              />
              <ControlButton
                label={"Удалить"}
                type="button"
                callback={() => {
                  setSelectedID(item.id);
                  setModalVisible(true);
                }}
              />
            </CatalogueControl>
          </CatalogueItem>
        ))}
      </CatalogueWrapper>
      <ModalWrapper isVisible={modalVisible} setIsVisible={setModalVisible}>
        <Confirm
          onConfirmAction={deleteRateItem}
          onCloseAction={setModalVisible}
        />
      </ModalWrapper>
    </React.Fragment>
  );
};

export default RatesHistory;
