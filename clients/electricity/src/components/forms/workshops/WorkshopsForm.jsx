import axios from "axios";
import React from "react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Error from "../../ui/error/Error";
import FormWrapper from "../../wrappers/form/FormWrapper";

const WorkshopsForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const stateItem = location.state?.item
  const [workshop, setWorkshop] = useState({ title: "" });
  const [error, setError] = useState("");

  const createWorkshop = async () => {
    await axios
      .post("/api/v1/electricity/workshops", workshop)
      .then((r) => {
        if (r.data.success) {
          navigate("/catalogues/workshops");
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason));
  };

  const updateWorkshop = async () => {
    await axios
      .patch(`/api/v1/electricity/workshops/${workshop.id}`, workshop)
      .then((r) => {
        if (r.data.success) {
          navigate("/catalogues/workshops");
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason));
  };

  useEffect(() => {
    if (stateItem) {
      setWorkshop({...stateItem});
    }
  }, [stateItem]);

  if (error) {
    return <Error message={error} />;
  }

  return (
    <FormWrapper>
      <div className="form__row">
        <label htmlFor="name" className="form__label">
          Наименование
        </label>
        <input
          type="text"
          className="form__input"
          name="name"
          value={workshop.title}
          onChange={(e) => setWorkshop({ ...workshop, title: e.target.value })}
        />
      </div>
      <div className="form__row">
        {workshop.id ? (
          <div className="form__button" onClick={updateWorkshop}>
            Обновить
          </div>
        ) : (
          <div className="form__button" onClick={createWorkshop}>
            Создать
          </div>
        )}
      </div>
    </FormWrapper>
  );
};

export default WorkshopsForm;
