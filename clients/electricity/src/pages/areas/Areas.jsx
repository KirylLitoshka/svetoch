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
import ObjectsList from "../objects/ObjectsList";

const Areas = () => {
  const [areas, setAreas] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setLoading] = useState(true);
  const [selectedID, setSelectedID] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [objectsModalVisible, setObjectsModalVisible] = useState(false);

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
      .catch((e) => setError(e.response.data.reason))
      .then(() => setLoading(false));
  };

  const deleteAreas = async () => {
    axios
      .delete(`/api/v1/electricity/areas/${selectedID}`)
      .then((r) => {
        if (r.data.success) {
          setAreas(areas.filter((area) => area.id !== selectedID));
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .then(() => setModalVisible(false));
  };

  useEffect(() => {
    getAreas();
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
        {areas.map((area) => (
          <CatalogueItem key={area.id} title={area.title}>
            <CatalogueControl>
              <ControlButton
                type="button"
                label="Объекты"
                callback={() => {
                  setSelectedID(area.id)
                  setObjectsModalVisible(true)
                }}
              />
              <ControlButton
                type="link"
                label="Изменить"
                linkURL="edit"
                linkState={{ item: area }}
              />
              <ControlButton
                label={"Удалить"}
                type="button"
                callback={() => {
                  setSelectedID(area.id);
                  setModalVisible(true);
                }}
              />
            </CatalogueControl>
          </CatalogueItem>
        ))}
      </CatalogueWrapper>
      <ModalWrapper isVisible={modalVisible} setIsVisible={setModalVisible}>
        <Confirm
          onConfirmAction={deleteAreas}
          onCloseAction={setModalVisible}
        />
      </ModalWrapper>
      <ModalWrapper
        isVisible={objectsModalVisible}
        setIsVisible={setObjectsModalVisible}
      >
        <ObjectsList
          closeAction={setObjectsModalVisible}
          field={"areas"}
          id={selectedID}
        />
      </ModalWrapper>
    </React.Fragment>
  );
};

export default Areas;
