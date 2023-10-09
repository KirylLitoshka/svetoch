import React, { useEffect, useState } from "react";
import PageTitle from "../../components/ui/title/PageTitle";
import { Link } from "react-router-dom";
import Error from "../../components/ui/error/Error";
import Loader from "../../components/ui/loader/Loader";
import axios from "axios";
import CatalogueWrapper from "../../components/wrappers/catalogue/CatalogueWrapper";
import CatalogueItem from "../../components/items/catalogue/CatalogueItem";
import CatalogueControl from "../../components/ui/controls/catalogue/CatalogueControl";
import ControlButton from "../../components/ui/buttons/controls/ControlButton";
import ModalWrapper from "../../components/wrappers/modal/ModalWrapper";
import Confirm from "../../components/ui/modals/confirm/Confirm";

const Meters = () => {
  const [meters, setMeters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});

  useEffect(() => {
    getMeters();
  }, []);

  const getMeters = async () => {
    axios
      .get("/api/v1/electricity/meters")
      .then((r) => {
        if (r.data.success) {
          setMeters(r.data.items);
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .then(() => setLoading(false));
  };

  const deleteMeter = async () => {
    axios
      .delete(`/api/v1/electricity/meters/${selectedItem.id}`)
      .then((r) => {
        if (r.data.success) {
          setMeters(meters.filter((meter) => meter.id !== selectedItem.id));
        } else {
          setError(r.data.reason)
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .then(() => setModalVisible(false));
  };

  if (error) {
    return <Error message={error} />;
  }
  if (loading) {
    return <Loader />;
  }

  return (
    <React.Fragment>
      <PageTitle>
        <Link to="add" className="page-main__button">
          + Добавить
        </Link>
      </PageTitle>
      <CatalogueWrapper>
        {meters.map((meter) => (
          <CatalogueItem key={meter.id} title={meter.title}>
            <div>Разрядность: {meter.capacity}</div>
            <CatalogueControl>
              <ControlButton
                type="button"
                label={"Удалить"}
                callback={() => {
                  setModalVisible(true);
                  setSelectedItem(meter);
                }}
              />
              <ControlButton
                type="link"
                label={"Изменить"}
                linkURL={"edit"}
                linkState={{ item: meter }}
              />
            </CatalogueControl>
          </CatalogueItem>
        ))}
      </CatalogueWrapper>
      <ModalWrapper isVisible={modalVisible} setIsVisible={setModalVisible}>
        <Confirm
          onConfirmAction={() => deleteMeter(selectedItem)}
          onCloseAction={setModalVisible}
        />
      </ModalWrapper>
    </React.Fragment>
  );
};

export default Meters;
