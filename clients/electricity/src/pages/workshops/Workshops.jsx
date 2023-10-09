import axios from "axios";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Loader from "../../components/ui/loader/Loader";
import Error from "../../components/ui/error/Error";
import CatalogueControl from "../../components/ui/controls/catalogue/CatalogueControl";
import ControlButton from "../../components/ui/buttons/controls/ControlButton";
import ModalWrapper from "../../components/wrappers/modal/ModalWrapper";
import Confirm from "../../components/ui/modals/confirm/Confirm";
import PageTitle from "../../components/ui/title/PageTitle";
import Accordion from "../../components/ui/accordion/Accordion";
import { showContent } from "../../utils/accordion";
import SubObjectsList from "../subobjects/SubObjectsList";

const Workshops = () => {
  const [workshops, setWorkshops] = useState([]);
  const [subObjects, setSubObjects] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setLoading] = useState(true);
  const [selectedID, setSelectedID] = useState(null);
  const [modalsVisible, setModalsVisible] = useState({
    confirm: false,
    subobjects: false,
  });

  const deleteWorkshop = async () => {
    axios
      .delete(`/api/v1/electricity/workshops/${selectedID}`)
      .then((r) => {
        if (r.data.success) {
          setWorkshops(
            workshops.filter((workshop) => workshop.id !== selectedID)
          );
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .then(() => setModalsVisible({ ...modalsVisible, confirm: false }));
  };

  useEffect(() => {
    const urls = [
      "/api/v1/electricity/workshops",
      "/api/v1/electricity/subobjects",
    ];
    const requests = urls.map((url) => axios.get(url));
    axios
      .all(requests)
      .then(
        axios.spread((...responses) => {
          if (responses.some((response) => !response.data.success)) {
            const error_responses = responses.filter(
              (resp) => !resp.data.success
            );
            const reasons = error_responses.map((resp) => resp.data.reason);
            const errors = reasons.join("\n");
            setError(errors);
          } else {
            setWorkshops(responses[0].data.items);
            setSubObjects(responses[1].data.items);
          }
        })
      )
      .then(() => setLoading(false));
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
      <Accordion>
        {workshops.map((workshop) => (
          <div className="accordion-list_item" key={workshop.id}>
            <div className="accordion-list_item__button" onClick={showContent}>
              {workshop.title}
            </div>
            <div className="accordion__content-wrapper">
              <div style={{ padding: "10px 0" }} className="accordion__content">
                <div>
                  Количество подобъектов: {workshop.subobjects_amount || 0}
                </div>
                <div>Количество объектов: {workshop.objects_amount || 0}</div>
                <div></div>
                <CatalogueControl>
                  <ControlButton
                    type={"button"}
                    label={"Подобъекты цеха"}
                    callback={() => {
                      setSelectedID(workshop.id);
                      setModalsVisible({ ...modalsVisible, subobjects: true });
                    }}
                  />
                  <ControlButton
                    type="link"
                    label="Изменить"
                    linkURL="edit"
                    linkState={{ item: workshop }}
                  />
                  <ControlButton
                    label={"Удалить"}
                    type="button"
                    callback={() => {
                      setSelectedID(workshop.id);
                      setModalsVisible({ ...modalsVisible, confirm: true });
                    }}
                  />
                </CatalogueControl>
              </div>
            </div>
          </div>
        ))}
      </Accordion>
      <ModalWrapper
        isVisible={modalsVisible.confirm}
        setIsVisible={() =>
          setModalsVisible({ ...modalsVisible, confirm: false })
        }
      >
        <Confirm
          onConfirmAction={deleteWorkshop}
          onCloseAction={() =>
            setModalsVisible({ ...modalsVisible, confirm: false })
          }
        />
      </ModalWrapper>

      <SubObjectsList
        subObjects={subObjects}
        workshopID={selectedID}
        isVisible={modalsVisible.subobjects}
        closeAction={() => {
          setSelectedID(null)
          setModalsVisible({ ...modalsVisible, subobjects: false });
        }}
      />
    </React.Fragment>
  );
};

export default Workshops;
