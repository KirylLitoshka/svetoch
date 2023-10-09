import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Error from "../../ui/error/Error";
import FormWrapper from "../../wrappers/form/FormWrapper";

const SubObjectsForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationItem = location.state?.item;
  const [subObject, setSubObject] = useState({ title: "" });
  const [error, setError] = useState("");

  const updateSubObject = async () => {
    axios.patch(`/api/v1/electricity/subobjects/${subObject.id}`, subObject).then((r) => {
      if (r.data.success) {
        navigate("/subobjects")
      } else {
        setError(r.data.reason)
      }
    }).catch((e) => setError(e.response.data.reason))
  }

  const createSubObject = async () => {
    axios.post("/api/v1/electricity/subobjects", subObject).then((r) => {
      if (r.data.success) {
        navigate("/subobjects")
      } else {
        setError(r.data.reason)
      }
    }).catch((e) => setError(e.response.data.reason))
  }

  useEffect(() => {
    if (locationItem) {
      setSubObject(locationItem);
    }
  }, [locationItem]);

  if (error) {
    <Error message={error} />;
  }

  return (
    <FormWrapper>
      <div className="form__row">
        <label htmlFor="title" className="form__label">
          Наименование
        </label>
        <input
          type="text"
          id="title"
          className="form__input"
          value={subObject.title}
          onChange={(e) =>
            setSubObject({ ...subObject, title: e.target.value })
          }
        />
      </div>
      <div className="form__row">
        {subObject.id ? (
          <div className="form__button" onClick={updateSubObject}>
            Обновить
          </div>
        ) : (
          <div className="form__button" onClick={createSubObject}>
            Создать
          </div>
        )}
      </div>
    </FormWrapper>
  );
};

export default SubObjectsForm;
