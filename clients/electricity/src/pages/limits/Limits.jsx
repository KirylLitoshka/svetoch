import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import PageTitle from "../../components/ui/title/PageTitle";
import { showContent } from "../../utils/accordion";
import Accordion from "../../components/ui/accordion/Accordion";
import CatalogueControl from "../../components/ui/controls/catalogue/CatalogueControl";
import ControlButton from "../../components/ui/buttons/controls/ControlButton";
import Confirm from "../../components/ui/modals/confirm/Confirm";
import ModalWrapper from "../../components/wrappers/modal/ModalWrapper";
import Loader from "../../components/ui/loader/Loader";
import Error from "../../components/ui/error/Error";
import ObjectsList from "../objects/ObjectsList";

const Limits = () => {
  const [limits, setLimits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});
  const [objectsListModalVisible, setObjectsListModalVisible] = useState(false);
  const [selectedID, setSelectedID] = useState(null);

  const deleteLimitItem = async () => {
    axios
      .delete(`/api/v1/electricity/limits/${selectedItem.id}`)
      .then((r) => {
        if (r.data.success) {
          setLimits(limits.filter((limit) => limit.id !== selectedItem.id));
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .then(() => setModalVisible(false));
  };

  useEffect(() => {
    const getLimits = async () => {
      axios
        .get("/api/v1/electricity/limits")
        .then((r) => {
          if (r.data.success) {
            setLimits(r.data.items);
          } else {
            setError(r.data.reason);
          }
        })
        .catch((e) => setError(e.response.data.reason))
        .then(() => setLoading(false));
    };

    getLimits();
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
          + Добавить
        </Link>
      </PageTitle>
      <Accordion>
        {limits.map((limit) => (
          <div className="accordion-list_item" key={limit.id}>
            <div className="accordion-list_item__button" onClick={showContent}>
              {limit.title}
            </div>
            <div className="accordion__content-wrapper">
              <div style={{ padding: "10px 0" }} className="accordion__content">
                <div>Киловатт: кол-во киловатт</div>
                <div>Количество точек: {limit.objects_amount}</div>
              </div>
              <CatalogueControl>
                <ControlButton
                  type={"button"}
                  label={"Точки"}
                  callback={() => {
                    setSelectedID(limit.id);
                    setObjectsListModalVisible(true);
                  }}
                />
                <ControlButton
                  label={"Изменить"}
                  type={"link"}
                  linkURL={"edit"}
                  linkState={{ item: limit }}
                />
                <ControlButton
                  type={"button"}
                  label={"Удалить"}
                  callback={() => {
                    setModalVisible(true);
                    setSelectedItem(limit);
                  }}
                />
              </CatalogueControl>
            </div>
          </div>
        ))}
      </Accordion>
      <ModalWrapper isVisible={modalVisible} setIsVisible={setModalVisible}>
        <Confirm
          onCloseAction={setModalVisible}
          onConfirmAction={deleteLimitItem}
        />
      </ModalWrapper>
      <ModalWrapper
        isVisible={objectsListModalVisible}
        setIsVisible={setObjectsListModalVisible}
      >
        <ObjectsList
          field={"limit"}
          id={selectedID}
          closeAction={setObjectsListModalVisible}
        />
      </ModalWrapper>
    </React.Fragment>
  );
};

export default Limits;
