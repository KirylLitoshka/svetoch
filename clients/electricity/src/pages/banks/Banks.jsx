import axios from "axios";
import React, { useEffect, useState } from "react";
import Loader from "../../components/ui/loader/Loader";
import Error from "../../components/ui/error/Error";
import PageTitle from "../../components/ui/title/PageTitle";
import { Link } from "react-router-dom";
import CatalogueWrapper from "../../components/wrappers/catalogue/CatalogueWrapper";
import CatalogueItem from "../../components/items/catalogue/CatalogueItem";
import ModalWrapper from "../../components/wrappers/modal/ModalWrapper";
import Confirm from "../../components/ui/modals/confirm/Confirm";
import CatalogueControl from "../../components/ui/controls/catalogue/CatalogueControl";
import ControlButton from "../../components/ui/buttons/controls/ControlButton";

const Banks = () => {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedItem, setSelectedItem] = useState({});
  const [modalVisible, setModalVisible] = useState(false);

  const deleteBank = async () => {
    axios
      .delete(`/api/v1/electricity/banks/${selectedItem.id}`)
      .then((r) => {
        if (r.data.success) {
          setBanks(banks.filter((bank) => bank.id !== selectedItem.id));
        } else {
          setError(r.data.reason);
        }
      })
      .then(() => setModalVisible(false))
      .catch((e) => setError(e.reponse.data.reason));
  };

  useEffect(() => {
    const getBanks = async () => {
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
    };

    getBanks();
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
        <Link to="add" className="page-main__button">
          Добавить
        </Link>
      </PageTitle>
      <CatalogueWrapper>
        {banks.map((bank) => (
          <CatalogueItem key={bank.id} title={bank.title}>
            <div>Код: {bank.code}</div>
            <CatalogueControl>
              <ControlButton
                type={"button"}
                label={"Удалить"}
                callback={() => {
                  setSelectedItem(bank);
                  setModalVisible(true);
                }}
              />
              <ControlButton
                type={"link"}
                label={"Изменить"}
                linkURL={"edit"}
                linkState={{ item: bank }}
              />
            </CatalogueControl>
          </CatalogueItem>
        ))}
      </CatalogueWrapper>
      <ModalWrapper isVisible={modalVisible} setIsVisible={setModalVisible}>
        <Confirm onCloseAction={setModalVisible} onConfirmAction={deleteBank} />
      </ModalWrapper>
    </React.Fragment>
  );
};

export default Banks;
