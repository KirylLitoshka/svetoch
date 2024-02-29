import React, { useEffect, useState } from "react";
import ErrorMessage from "../../components/ui/messages/ErrorMessage";
import Loader from "../../components/ui/loader/Loader";
import axios from "axios";
import Accordion from "../../components/wrappers/accordion/Accordion";

const Revise = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [codes, setCodes] = useState([]);
  const [objects, setObjects] = useState([]);
  const [selectedCodeID, setSelectedCodeID] = useState(null);

  const onSelect = (e) => {
    const codeItemButtons = document.querySelectorAll(".accordion-item_button");
    codeItemButtons.forEach((item) =>
      item.classList.remove("accordion-item_button__active")
    );
    if (e.target.classList.contains("accordion-item_button")) {
      e.target.classList.add("accordion-item_button__active");
    } else {
      e.target.parentElement.classList.toggle("accordion-item_button__active");
    }
  };

  const getCodes = async () => {
    axios
      .get("/api/v1/warmth/reconciliation_codes", {
        params: { revise: true },
      })
      .then((r) => {
        if (r.data.success) {
          setCodes(r.data.items);
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .finally(() => setLoading(false));
  };

  const getObjects = async () => {
    axios
      .get(`/api/v1/warmth/reconciliation_codes/${selectedCodeID}/payments`)
      .then((r) => {
        if (r.data.success) {
          setObjects(r.data.items);
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason));
  };

  useEffect(() => {
    getCodes();
  }, []);

  useEffect(() => {
    if (selectedCodeID) {
      getObjects();
    } else {
      setObjects([]);
    }
  }, [selectedCodeID]);

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <React.Fragment>
      <div style={{ maxHeight: "30vh", overflow: "auto", marginBottom: "35px" }}>
        <Accordion>
          <div style={{display: "flex", padding: "0 18px", fontWeight: "bold"}}>
            <div style={{width: "20%"}}>Наименование</div>
            <div style={{width: "16%"}}>Отопление|Гкал</div>
            <div style={{width: "16%"}}>Отопление|Руб</div>
            <div style={{width: "16%"}}>ГВС|Гкал</div>
            <div style={{width: "16%"}}>ГВС|Руб</div>
            <div style={{width: "16%"}}>Итого|Руб</div>
            <div style={{width: "18px"}}></div>
          </div>
          {codes.map((code, index) => (
            <div className="accordion-item" key={index}>
              <div
                className="accordion-item_button"
                onClick={(e) => {
                  onSelect(e);
                  setSelectedCodeID(code.id);
                }}
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <div style={{ width: "20%" }}>{code.title}</div>
                <div style={{ width: "16%" }}>
                  {code.heating_value.toFixed(4)}
                </div>
                <div style={{ width: "16%" }}>
                  {code.heating_cost.toFixed(2)}
                </div>
                <div style={{ width: "16%" }}>
                  {code.water_heating_value.toFixed(4)}
                </div>
                <div style={{ width: "16%" }}>
                  {code.water_heating_cost.toFixed(2)}
                </div>
                <div style={{ width: "16%" }}>
                  {(code.water_heating_cost + code.heating_cost).toFixed(2)}
                </div>
              </div>
              <div className="accordion-item_content">
                <div className="accordion-item_content-wrapper"></div>
              </div>
            </div>
          ))}
        </Accordion>
      </div>
      <div style={{maxHeight: "60vh", overflow: "auto"}}>
        {objects.length > 0 ? (
          <table style={{ width: "100%", textAlign: "center" }}>
            <thead>
              <tr>
                <th>Код</th>
                <th>Наименование</th>
                <th>Тип платежа</th>
                <th>Тариф</th>
                <th>Отопление/Гкал</th>
                <th>Отопление/Руб</th>
                <th>ГВС/Гкал</th>
                <th>ГВС/Руб</th>
              </tr>
            </thead>
            <tbody>
              {objects.map((obj, index) => (
                <tr key={index} style={{lineHeight: "27px"}}>
                  <td>{obj.code}</td>
                  <td>{obj.title}</td>
                  <td>{obj.payment_type == 1 ? "Основной" : "Поправка"}</td>
                  <td>{obj.applied_rate_value}</td>
                  <td>{obj.heating_value.toFixed(4)}</td>
                  <td>{obj.heating_cost.toFixed(2)}</td>
                  <td>{obj.water_heating_value.toFixed(4)}</td>
                  <td>{obj.water_heating_cost.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{textAlign: "center", fontWeight: "bold"}}>Не выбран код сверки</div>
        )}
      </div>
    </React.Fragment>
  );
};

export default Revise;
