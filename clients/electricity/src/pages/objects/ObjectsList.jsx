import React, { useEffect, useState } from "react";
import Loader from "../../components/ui/loader/Loader";
import Error from "../../components/ui/error/Error";
import axios from "axios";
import Accordion from "../../components/ui/accordion/Accordion";
import UserDate from "../../components/ui/date/Date";
import { showContent } from "../../utils/accordion";
import CloseButton from "../../components/ui/buttons/close/CloseButton";

const ObjectsList = ({ field, id, closeAction }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [objects, setObjects] = useState([]);

  useEffect(() => {
    setLoading(true);
    const getObjects = async () => {
      const params =
        field === "renter"
          ? { renter: id }
          : field === "subobject"
          ? { subobject: id }
          : field === "areas"
          ? { area: id }
          : { limit: id };
      axios
        .get(`/api/v1/electricity/objects`, { params })
        .then((r) => {
          if (r.data.success) {
            setObjects(r.data.items);
          } else {
            setError(r.data.reason);
          }
        })
        .catch((e) => setError(e.response.data.reason))
        .then(() => setLoading(false));
    };

    if (id) {
      getObjects();
    }
  }, [id, field]);

  if (loading) {
    return <Loader />;
  }
  if (error) {
    return <Error message={error} />;
  }

  return (
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
      <div>
        <CloseButton closeAction={closeAction} />
        <Accordion>
          {objects.map((obj) => (
            <div className="accordion-list_item" key={obj.id}>
              <div
                className="accordion-list_item__button"
                onClick={showContent}
              >
                {obj.title}
              </div>
              <div className="accordion__content-wrapper">
                <div
                  style={{ padding: "10px 0" }}
                  className="accordion__content"
                >
                  <div>
                    Шифр объекта: {obj.cipher.code} {obj.cipher.title}
                  </div>
                  <div>Точка учета: {obj.counting_point || "Не указана"}</div>
                  <div>Участок: {obj.area.title}</div>
                  {obj.meter && (
                    <React.Fragment>
                      <UserDate
                        label={"Дата установки"}
                        date={obj.meter.installation_date}
                      />
                      <div>Последние показания: {obj.meter.last_reading}</div>
                      {obj.meter.type && (
                        <React.Fragment>
                          <div>Счетчик: {obj.meter.type.title}</div>
                          <div>
                            Разрядность счетчика: {obj.meter.type.capacity}
                          </div>
                        </React.Fragment>
                      )}
                      <div>Номер счетчика: {obj.meter.number}</div>
                    </React.Fragment>
                  )}
                </div>
              </div>
            </div>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default ObjectsList;
