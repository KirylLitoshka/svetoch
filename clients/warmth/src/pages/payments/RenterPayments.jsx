import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Loader from "../../components/ui/loader/Loader";
import ErrorMessage from "../../components/ui/messages/ErrorMessage";
import Accordion from "../../components/wrappers/accordion/Accordion";

const RenterPayments = () => {
  const location = useLocation();
  const renterItem = location.state?.item;
  const [renterPayments, setRenterPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const onSelect = (e) => {
    let content = e.target.nextElementSibling;
    if (e.target.classList.contains("accordion-item_button")) {
      e.target.classList.toggle("accordion-item_button__active");
    } else {
      content = e.target.parentElement.nextElementSibling;
      e.target.parentElement.classList.toggle("accordion-item_button__active");
    }
    if (content.style.maxHeight) {
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    }
  };

  const getRenterPayments = async () => {
    axios
      .get(`/api/v1/warmth/renters/${renterItem.id}/payments`)
      .then((r) => {
        if (r.data.success) {
          setRenterPayments(r.data.items);
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (renterItem?.id) {
      getRenterPayments();
    }
  }, [renterItem]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <React.Fragment>
      <Accordion>
        {renterPayments.map((item, index) => (
          <div className="accordion-item" key={index}>
            <div
              className="accordion-item_button"
              onClick={onSelect}
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <div>
                {("0" + item.month).slice(-2)}.{item.year}
              </div>
              <div>Отопление: {item.total.heating_value}</div>
              <div>ГВС: {item.total.water_heating_value.toFixed(4)}</div>
              <div>Начислено: {item.total.cost.toFixed(2)}</div>
              <div>Эквивалент: {item.total.coefficient.toFixed(2)}</div>
              <div>НДС: {item.total.vat.toFixed(2)}</div>
              <div>Итого: {item.total.total.toFixed(2)}</div>
            </div>
            <div className="accordion-item_content">
              <div className="accordion-item_content-wrapper">
                <table style={{width: "100%"}}>
                  <thead>
                    <tr>
                      <th>Наименование</th>
                      <th>Тип</th>
                      <th>Количество</th>
                      <th>Начислено</th>
                      <th>Эквивалент</th>
                      <th>НДС</th>
                      <th>Итого</th>
                    </tr>
                  </thead>
                  <tbody>
                    {item.includes.map((inc, index) => (
                      <tr key={index} style={{textAlign: "center"}}>
                        <td>{inc.title}</td>
                        <td>{inc.type}</td>
                        <td>{inc.value}</td>
                        <td>{inc.cost}</td>
                        <td>{inc.coefficient}</td>
                        <td>{inc.vat}</td>
                        <td>{inc.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </Accordion>
    </React.Fragment>
  );
};

export default RenterPayments;
