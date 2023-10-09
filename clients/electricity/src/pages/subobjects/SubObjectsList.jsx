import React, { useEffect, useState } from "react";
import Loader from "../../components/ui/loader/Loader";
import Error from "../../components/ui/error/Error";
import axios from "axios";
import CloseButton from "../../components/ui/buttons/close/CloseButton";
import Accordion from "../../components/ui/accordion/Accordion";
import { showContent } from "../../utils/accordion";
import AccordionButton from "../../components/ui/buttons/accordion/AccordionButton";
import ModalWrapper from "../../components/wrappers/modal/ModalWrapper";

const SubObjectsList = ({ subObjects, workshopID, isVisible, closeAction }) => {
  const [selectedSubObjects, setSelectedSubObjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);

  const closeModalList = () => {
    setLoading(true);
    setSelectedSubObjects([]);
    setEditMode(false);
    closeAction();
  };

  const addSubObjectToWorkshop = async (subObject) => {
    axios
      .post(
        `/api/v1/electricity/workshops/${workshopID}/subobjects/${subObject.id}`
      )
      .then((r) => {
        if (r.data.success) {
          setSelectedSubObjects([...selectedSubObjects, subObject]);
        } else {
          setError(r.data.reason);
        }
      });
  };

  const deleteSubObjectFromWorkshop = async (subObject) => {
    axios
      .delete(
        `/api/v1/electricity/workshops/${workshopID}/subobjects/${subObject.id}`
      )
      .then((r) => {
        if (r.data.success) {
          setSelectedSubObjects(
            selectedSubObjects.filter((item) => item.id !== subObject.id)
          );
        } else {
          setError(r.data.reason);
        }
      });
  };

  const subObjectClickAction = (subObject) => {
    if (selectedSubObjects.find((item) => item.id === subObject.id)) {
      deleteSubObjectFromWorkshop(subObject);
    } else {
      addSubObjectToWorkshop(subObject);
    }
  };

  useEffect(() => {
    if (workshopID) {
      axios
        .get("/api/v1/electricity/subobjects", {
          params: { workshop: workshopID },
        })
        .then((r) => {
          if (r.data.success) {
            setSelectedSubObjects(r.data.items);
          } else {
            setError(r.data.reason);
          }
        })
        .catch((e) => setError(e.response.data.reason))
        .then(() => setLoading(false));
    } else {
      setLoading(true);
      setSelectedSubObjects([]);
    }
  }, [workshopID]);

  if (loading) {
    return (
      <ModalWrapper isVisible={isVisible} setIsVisible={closeModalList}>
        <Loader />;
      </ModalWrapper>
    );
  }
  if (error) {
    return (
      <ModalWrapper isVisible={isVisible} setIsVisible={closeModalList}>
        <Error message={error} />;
      </ModalWrapper>
    );
  }

  return (
    <ModalWrapper isVisible={isVisible} setIsVisible={closeModalList}>
      <div
        style={{
          minWidth: "80vw",
          maxHeight: "55vh",
          backgroundColor: "white",
          borderRadius: "20px",
          overflowY: "overlay",
          padding: "10px",
        }}
      >
        <CloseButton closeAction={closeModalList} />
        {editMode ? (
          <div>
            <Accordion>
              {subObjects.map((subObject) => (
                <div className="accordion-list_item" key={subObject.id}>
                  <div
                    className={
                      "accordion-list_item__button" +
                      (selectedSubObjects.find(
                        (selectedItem) => selectedItem.id === subObject.id
                      )
                        ? " accordion-list_item__button_active"
                        : "")
                    }
                    onClick={() => subObjectClickAction(subObject)}
                  >
                    {subObject.title}
                  </div>
                </div>
              ))}
              <AccordionButton
                label={"Сохранить"}
                action={() => setEditMode(false)}
              />
            </Accordion>
          </div>
        ) : (
          <div>
            <Accordion>
              {selectedSubObjects.map((subObject) => (
                <div className="accordion-list_item" key={subObject.id}>
                  <div
                    className="accordion-list_item__button"
                    onClick={showContent}
                  >
                    {subObject.title}
                  </div>
                  <div className="accordion__content-wrapper">
                    <div
                      style={{ padding: "10px 0" }}
                      className="accordion__content"
                    >
                      <div>Киловатты: тут будет сумма киловатт</div>
                      <div>Количество точек: {subObject.objects_amount}</div>
                    </div>
                  </div>
                </div>
              ))}
              <AccordionButton
                label={"Добавить"}
                action={() => setEditMode(true)}
              />
            </Accordion>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
};

export default SubObjectsList;
