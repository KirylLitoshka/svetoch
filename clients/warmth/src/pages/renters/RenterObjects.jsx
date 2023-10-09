import axios from "axios";
import React, { useEffect, useState } from "react";
import ModalWrapper from "../../components/wrappers/modal/ModalWrapper";
import Accordion from "../../components/wrappers/accordion/Accordion";
import AccordionItem from "../../components/ui/accordion/AccordionItem";
import ErrorMessage from "../../components/ui/messages/ErrorMessage";
import Loader from "../../components/ui/loader/Loader";
import PageTitle from "../../components/ui/title/PageTitle";
import Button from "../../components/ui/buttons/base/Button";

const RenterObjects = ({ selectedItem, isVisible, closeModal }) => {
  const [renterObjects, setRenterObjects] = useState([]);
  const [objects, setObjects] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const objectsIDs = renterObjects.map((obj) => obj.object_id);
  const selectedObjects = objects.filter((obj) => objectsIDs.includes(obj.id));

  const getRenterObjects = async () => {
    axios
      .get(`/api/v1/warmth/renters/${selectedItem.id}/objects`)
      .then((r) => {
        if (r.data.success) {
          setError("");
          setRenterObjects(r.data.items);
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .then(() => setLoading(false));
  };

  const getObjects = async () => {
    axios
      .get("/api/v1/warmth/objects")
      .then((r) => {
        if (r.data.success) {
          setObjects(r.data.items);
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason));
  };

  const createRenterObject = async (item) => {
    axios
      .post(`/api/v1/warmth/renters/${selectedItem.id}/objects`, {
        renter_id: selectedItem.id,
        object_id: item.id,
      })
      .then((r) => {
        if (r.data.success) {
          setRenterObjects([...renterObjects, r.data.item]);
        } else {
          setError(r.data.reason);
        }
      });
  };

  const deleteRenterObject = async (item) => {
    axios
      .delete(`/api/v1/warmth/renters/${selectedItem.id}/objects/${item.id}`)
      .then((r) => {
        if (r.data.success) {
          setRenterObjects(
            renterObjects.filter((obj) => obj.object_id !== item.id)
          );
        } else {
          setEditMode(r.data.reason);
        }
      });
  };

  const editModeHandler = (item) => {
    if (objectsIDs.includes(item.id)) {
      deleteRenterObject(item);
    } else {
      createRenterObject(item);
    }
  };

  useEffect(() => {
    if (selectedItem?.id) {
      getRenterObjects();
    } else {
      setRenterObjects([]);
      setLoading(true);
    }
  }, [selectedItem]);

  useEffect(() => {
    getObjects();
  }, []);

  return (
    <ModalWrapper closeModal={closeModal} isVisible={isVisible}>
      {error ? (
        <ErrorMessage message={error} />
      ) : loading ? (
        <Loader />
      ) : editMode ? (
        <div
          style={{
            width: "80vw",
            maxHeight: "80vh",
            overflowY: "auto",
            padding: "10px",
          }}
        >
          <PageTitle>
            <Button callback={() => setEditMode(false)} text={"Назад"} />
          </PageTitle>
          <Accordion>
            {objects.map((obj) => (
              <AccordionItem
                key={obj.id}
                title={obj.title}
                controls={[]}
                callback={() => editModeHandler(obj)}
                selected={objectsIDs.includes(obj.id)}
              />
            ))}
          </Accordion>
        </div>
      ) : (
        <div
          style={{
            width: "80vw",
            maxHeight: "80vh",
            overflowY: "auto",
            padding: "10px",
          }}
        >
          <PageTitle>
            <Button callback={() => setEditMode(true)} text={"Добавить"} />
          </PageTitle>
          <Accordion>
            {selectedObjects.map((obj) => (
              <AccordionItem key={obj.id} title={obj.title} controls={[]}>
                <div>Код сбыта: {obj.code || "Не указан"}</div>
                <div>
                  Стутас объекта: {obj.is_closed ? "Закрыт" : "Действителен"}
                </div>
                <div>Отопление: {obj.is_heating_available ? "Да" : "Нет"}</div>
                <div>ГВС: {obj.is_water_heating_available ? "Да" : "Нет"}</div>
                <div>НДС: {obj.vat}%</div>
                <div>Тариф: {obj?.rate ? obj.rate.title : "Не указан"}</div>
                <div>
                  Цех: {obj?.workshop ? obj.workshop.title : "Не указан"}
                </div>
                <div>
                  Код сверки:{" "}
                  {obj?.reconciliation_code
                    ? obj.reconciliation_code.title
                    : "Не указан"}
                </div>
                {obj.is_meter_unavailable ? (
                  <div style={{ color: "red" }}>Объект без прибора учета</div>
                ) : (
                  ""
                )}
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </ModalWrapper>
  );
};

export default RenterObjects;
