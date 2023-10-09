import React, { useEffect, useState } from "react";
import FormWrapper from "../../wrappers/form/FormWrapper";
import axios from "axios";
import Error from "../../ui/error/Error";
import Loader from "../../ui/loader/Loader";
import Button from "../../ui/buttons/default/Button";

const ObjectLimitsForm = ({ objectID, onCloseAction }) => {
  const [objectLimits, setObjectLimits] = useState([]);
  const [limits, setLimits] = useState([]);
  const [renters, setRenters] = useState([]);
  const [subObjects, setSubObjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const deleteObjectLimit = async (i) => {
    const limitID = objectLimits[i].id;
    if (limitID) {
      axios
        .delete(`/api/v1/electricity/objects/${objectID}/limits/${limitID}`)
        .then((r) => {
          if (r.data.success) {
            setObjectLimits(objectLimits.filter((item) => item.id !== limitID));
          } else {
            setError(r.data.reason);
          }
        });
    } else {
      setObjectLimits(
        objectLimits.filter((item) => objectLimits.indexOf(item) !== i)
      );
    }
  };

  const postObjectLimits = async () => {
    axios
      .post(`/api/v1/electricity/objects/${objectID}/limits`, objectLimits)
      .then((r) => {
        if (r.data.success) {
          onCloseAction();
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason));
  };

  useEffect(() => {
    const fetchData = async () => {
      const requestURLs = [
        "/api/v1/electricity/limits",
        "/api/v1/electricity/subobjects",
        "/api/v1/electricity/renters",
      ];

      const requests = requestURLs.map((url) => axios.get(url));

      axios
        .all(requests)
        .then(
          axios.spread((...responses) => {
            const statuses = responses.map((response) => response.data.success);
            if (statuses.includes(false)) {
              const errorResponses = responses.filter(
                (res) => !res.data.success
              );
              const reasons = errorResponses.map(
                (resp) => `Error at ${resp.config.url}: ${resp.data.reason}`
              );
              setError(reasons.join("\n"));
            } else {
              setLimits(responses[0].data.items);
              setSubObjects(responses[1].data.items);
              setRenters(responses[2].data.items);
            }
          })
        )
        .then(() => setLoading(false));
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchObjectLimits = async () => {
      axios
        .get(`/api/v1/electricity/objects/${objectID}/limits`)
        .then((r) => {
          if (r.data.success) {
            setObjectLimits(r.data.items);
          } else {
            setError(r.data.reason);
          }
        })
        .catch((e) => setError(e.response.data.reason))
        .then(() => setLoading(false));
    };
    if (objectID) {
      setError("")
      setLoading(true);
      fetchObjectLimits();
    }
  }, [objectID]);

  if (loading) {
    return (
      <div
        style={{
          backgroundColor: "white",
          padding: "10px 5px",
          borderRadius: "10px",
        }}
      >
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          backgroundColor: "white",
          padding: "0 5px",
          borderRadius: "10px",
        }}
      >
        <Error message={error} />
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "10px 5px",
        borderRadius: "10px",
        minWidth: "470px",
      }}
    >
      {objectLimits.map((objectLimit, index) => (
        <div key={index} style={{ display: "flex", alignItems: "center" }}>
          <FormWrapper bordered={true}>
            <div className="form__row">
              <label htmlFor={`limit_${index}`} className="form__label">
                Предельный уровень
              </label>
              <select
                name={`limit_${index}`}
                id={`limit_${index}`}
                className="form__input"
                defaultValue={objectLimit.limit_id || "default"}
                onChange={(e) =>
                  setObjectLimits((prevState) =>
                    prevState.map((item, i) =>
                      i === index
                        ? { ...item, limit_id: parseInt(e.target.value) }
                        : item
                    )
                  )
                }
              >
                <option value="default">Не указан</option>
                {limits.map((limit) => (
                  <option key={limit.id} value={limit.id}>
                    {limit.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="form__row">
              <label htmlFor={`subobject_${index}`} className="form__label">
                Подобъект
              </label>
              <select
                name={`subobject_${index}`}
                id={`subobject_${index}`}
                className="form__input"
                defaultValue={objectLimit.subobject_id || "default"}
                onChange={(e) =>
                  setObjectLimits((prevState) =>
                    prevState.map((item, i) =>
                      i === index
                        ? {
                            ...item,
                            subobject_id: parseInt(e.target.value) || null,
                          }
                        : item
                    )
                  )
                }
              >
                <option value="default">Не указан</option>
                {subObjects.map((subobject) => (
                  <option key={subobject.id} value={subobject.id}>
                    {subobject.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="form__row">
              <label htmlFor={`renter_${index}`} className="form__label">
                Арендатор
              </label>
              <select
                name={`renter_${index}`}
                id={`renter_${index}`}
                className="form__input"
                defaultValue={objectLimit.renter_id || "default"}
                onChange={(e) =>
                  setObjectLimits((prevState) =>
                    prevState.map((item, i) =>
                      i === index
                        ? {
                            ...item,
                            renter_id: parseInt(e.target.value) || null,
                          }
                        : item
                    )
                  )
                }
              >
                <option value="default">Не указан</option>
                {renters.map((renter) => (
                  <option key={renter.id} value={renter.id}>
                    {renter.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form__row">
              <label htmlFor={`percentage_${index}`} className="form__label">
                Процент начислений
              </label>
              <input
                type="text"
                id={`percentage_${index}`}
                className="form__input"
                value={objectLimit.percentage || 0}
                onChange={(e) =>
                  setObjectLimits((prevState) =>
                    prevState.map((item, i) =>
                      i === index
                        ? { ...item, percentage: parseFloat(e.target.value) }
                        : item
                    )
                  )
                }
              />
            </div>
          </FormWrapper>
          <Button size={40} type={"delete"} action={() => deleteObjectLimit(index)} />
        </div>
      ))}
      <div className="form__row" style={{ marginBottom: "10px" }}>
        <div
          className="form__button"
          onClick={() =>
            setObjectLimits([
              ...objectLimits,
              {
                object_id: objectID,
                limit_id: null,
                subobject_id: null,
                renter_id: null,
                percentage: null,
              },
            ])
          }
        >
          Добавить еще
        </div>
      </div>
      <div className="form__row">
        <div className="form__button" onClick={postObjectLimits}>
          Сохранить
        </div>
      </div>
    </div>
  );
};

export default ObjectLimitsForm;
