import React, { useEffect, useState } from "react";
import Button from "../../components/ui/buttons/base/Button";
import axios from "axios";
import Loader from "../../components/ui/loader/Loader";
import ErrorMessage from "../../components/ui/messages/ErrorMessage";

const WorkshopForm = ({ selectedItem, onCreate, onUpdate }) => {
  const [workshop, setWorkshop] = useState({
    title: "",
    group: { id: null },
    is_currency_coefficient_applied: false,
  });
  const [workshopsGroups, setWorkshopsGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getWorkshopsGroups = async () => {
    axios
      .get("/api/v1/warmth/workshops_groups")
      .then((r) => {
        if (r.data.success) {
          setWorkshopsGroups(r.data.items);
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getWorkshopsGroups();
  }, []);

  useEffect(() => {
    if (selectedItem?.id) {
      setWorkshop(selectedItem);
    } else {
      setWorkshop({
        title: "",
        group: { id: null },
        is_currency_coefficient_applied: false,
      });
    }
  }, [selectedItem]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <React.Fragment>
      <div className="form-row">
        <label htmlFor="title" className="form_label">
          Наименование
        </label>
        <input
          className="form_input"
          id="title"
          type="text"
          value={workshop.title}
          onChange={(e) => setWorkshop({ ...workshop, title: e.target.value })}
        />
      </div>
      <div className="form-row">
        <label htmlFor="workshop" className="form_label">
          Группа
        </label>
        <select
          name="workshop"
          id="workshop"
          className="form_input"
          value={workshop.group?.id || ""}
          onChange={(e) => {
            let group = workshopsGroups.find(
              (group) => group.id === +e.target.value
            );
            if (!group) {
              group = {id: null}
            }
            setWorkshop({ ...workshop, group: group });
          }}
        >
          <option value="">Не указан</option>
          {workshopsGroups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.title}
            </option>
          ))}
        </select>
      </div>
      <div className="form-row">
        <label htmlFor="currency" className="form_label">
          Применение коэффициента
        </label>
        <input
          type="checkbox"
          name="currency"
          id="currency"
          className="form_input"
          checked={workshop.is_currency_coefficient_applied}
          onChange={() =>
            setWorkshop({
              ...workshop,
              is_currency_coefficient_applied:
                !workshop.is_currency_coefficient_applied,
            })
          }
        />
      </div>
      <div className="form-row">
        {selectedItem ? (
          <Button text={"Обновить"} callback={() => onUpdate(workshop)} />
        ) : (
          <Button text={"Добавить"} callback={() => onCreate(workshop)} />
        )}
      </div>
    </React.Fragment>
  );
};

export default WorkshopForm;
