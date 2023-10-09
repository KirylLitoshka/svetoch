import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Error from "../../components/ui/error/Error";
import Loader from "../../components/ui/loader/Loader";
import PageTitle from "../../components/ui/title/PageTitle";
import Accordion from "../../components/ui/accordion/Accordion";
import { showContent } from "../../utils/accordion";
import CatalogueControl from "../../components/ui/controls/catalogue/CatalogueControl";
import ControlButton from "../../components/ui/buttons/controls/ControlButton";
import axios from "axios";
import ModalWrapper from "../../components/wrappers/modal/ModalWrapper";
import Confirm from "../../components/ui/modals/confirm/Confirm";
import CloseButton from "../../components/ui/buttons/close/CloseButton";
import FormWrapper from "../../components/wrappers/form/FormWrapper";

const Subabonents = () => {
  const location = useLocation();
  const { objects, objectID } = location.state;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [objectRenters, setObjectsRenters] = useState([]);
  const [selectedID, setSelectedID] = useState(null);
  const [modalsVisible, setModalsVisible] = useState({
    confirm: false,
    adding: false,
  });
  const [selectedItem, setSelectedItem] = useState({});

  const setCurrentObject = (e) => {
    const filteredObjects = objects.filter((obj) =>
      obj.title.toLowerCase().includes(e.target.value.toLowerCase())
    );
    if (filteredObjects.length == 1) {
      setSelectedItem({ ...selectedItem, ...filteredObjects[0] });
    }
  };

  const addObjectRenter = async () => {
    if (!selectedItem.id) {
      return
    }
    axios
      .post(`/api/v1/electricity/objects/${objectID}/renters`, {
        object_id: objectID,
        is_local: selectedItem.is_local,
        subrenter_id: selectedItem.id,
      })
      .then((r) => {
        closeModal()
        if (r.data.success) {
          setObjectsRenters([...objectRenters, selectedItem])
        } else {
          setError(r.data.reason)
        }
      });
  };

  const deleteObjectRenter = async () => {
    axios
      .delete(`/api/v1/electricity/objects/${objectID}/renters/${selectedID}`)
      .then((r) => {
        if (r.data.success) {
          setSelectedID(null);
          setObjectsRenters(objectRenters.filter(obj => obj.id !== selectedID))
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => {
        setError(e.response.data.reason);
      })
      .finally(() => {
        setModalsVisible({ ...modalsVisible, confirm: false });
      });
  };

  const closeModal = (key) => {
    if (key === "delete") {
      setModalsVisible({ ...modalsVisible, confirm: false });
      setSelectedID(null);
    } else {
      setModalsVisible({ ...modalsVisible, adding: false });
      setSelectedItem({});
    }
    document.querySelector(".form").reset();
  };

  useEffect(() => {
    axios
      .get(`/api/v1/electricity/objects/${objectID}/renters`)
      .then((r) => {
        if (r.data.success) {
          setObjectsRenters(r.data.items);
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .then(() => setLoading(false));
  }, [objectID]);

  if (error) {
    return <Error message={error} />;
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <React.Fragment>
      <PageTitle>
        <button
          className="page-main__button"
          style={{ fontFamily: "inherit", border: "none" }}
          onClick={() => setModalsVisible({ ...modalsVisible, adding: true })}
        >
          + Добавить
        </button>
      </PageTitle>
      {objectRenters.length === 0 ? (
        <Error message={"У данного объекта нет субабонентов"} />
      ) : (
        <Accordion>
          {objectRenters.map((item) => (
            <div className="accordion-list_item" key={item.id}>
              <div
                className="accordion-list_item__button"
                onClick={showContent}
              >
                {item.title}
              </div>
              <div className="accordion__content-wrapper">
                <div
                  style={{ padding: "10px 0" }}
                  className="accordion__content"
                >
                  <div>Точка учета: {item.counting_point || "Не указана"}</div>
                  <div>Учет: {item.is_local ? "Тех.учет" : "Ком.учет"}</div>
                </div>

                <CatalogueControl>
                  <ControlButton
                    label={"Удалить"}
                    type={"button"}
                    callback={() => {
                      setSelectedID(item.id);
                      setModalsVisible({ ...modalsVisible, confirm: true });
                    }}
                  />
                </CatalogueControl>
              </div>
            </div>
          ))}
        </Accordion>
      )}
      <ModalWrapper
        isVisible={modalsVisible.confirm}
        setIsVisible={() => closeModal("delete")}
      >
        <Confirm
          onCloseAction={() => closeModal("delete")}
          onConfirmAction={deleteObjectRenter}
        />
      </ModalWrapper>
      <ModalWrapper
        isVisible={modalsVisible.adding}
        setIsVisible={() => closeModal("adding")}
      >
        <div
          style={{
            minWidth: "60%",
            maxHeight: "55vh",
            backgroundColor: "white",
            borderRadius: "20px",
            overflowY: "overlay",
            padding: "10px",
          }}
        >
          <CloseButton closeAction={() => closeModal("adding")} />
          <FormWrapper>
            <div className="form__row">
              <label htmlFor="object" className="form__label">
                Объект
              </label>
              <input
                type="text"
                className="form__input"
                id="object"
                list="objects"
                onChange={setCurrentObject}
                autoComplete="false"
              />
              <datalist id="objects">
                {objects.map((object) => (
                  <option key={object.id} value={object.title} />
                ))}
              </datalist>
            </div>
            <div className="form__row">
              <label htmlFor="is_local" className="form__label">
                Учёт
              </label>
              <select
                className="form__input"
                name="is_local"
                id="is_local"
                defaultValue={"default"}
                required
                onChange={(e) =>
                  setSelectedItem({
                    ...selectedItem,
                    is_local: Boolean(+e.target.value),
                  })
                }
              >
                <option disabled value={"default"}>
                  Не указано
                </option>
                <option value={0}>Ком. учет</option>
                <option value={1}>Тех. учет</option>
              </select>
            </div>
            <div className="form__row">
              <div
                className="form__button"
                onClick={addObjectRenter}
              >
                Добавить
              </div>
            </div>
          </FormWrapper>
        </div>
      </ModalWrapper>
    </React.Fragment>
  );
};

export default Subabonents;
