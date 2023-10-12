import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ErrorMessage from "../../components/ui/messages/ErrorMessage";
import Loader from "../../components/ui/loader/Loader";
import PageTitle from "../../components/ui/title/PageTitle";
import Button from "../../components/ui/buttons/base/Button";
import Form from "../../components/ui/form/Form";
import PaymentForm from "../../forms/payment/PaymentForm";
import ConfirmModal from "../../components/modals/confirm/ConfirmModal";
import edit from "../../icons/edit.png";
import del from "../../icons/delete.png";

const ObjectPayments = () => {
  const location = useLocation();
  const objectID = location?.state?.objectID;
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalsVisible, setModalsVisible] = useState({
    create: false,
    delete: false,
  });

  const getObjectsPayments = async () => {
    axios
      .get(`/api/v1/warmth/objects/${objectID}/payments`)
      .then((r) => {
        if (r.data.success) {
          setPayments(r.data.items);
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .then(() => setLoading(false));
  };

  const updateObjectPayment = async (item) => {
    axios
      .patch(`/api/v1/warmth/objects/${objectID}/payments/${item.id}`, {
        ...item,
        applied_rate_value: parseFloat(item["applied_rate_value"]) || 0,
        heating_value: parseFloat(item["heating_value"]) || 0,
        heating_cost: parseFloat(item["heating_cost"]) || 0,
        water_heating_value: parseFloat(item["water_heating_value"]) || 0,
        water_heating_cost: parseFloat(item["water_heating_cost"]) || 0,
      })
      .then((r) => {
        if (r.data.success) {
          setPayments(payments.map((obj) => (obj.id === item.id ? item : obj)));
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason)).then(() => {
        setSelectedItem({})
        setModalsVisible({...modalsVisible, create: false})
      });
  };

  const createObjectPayment = async (item) => {
    axios
      .post(`/api/v1/warmth/objects/${objectID}/payments`, {
        ...item,
        object_id: objectID,
        applied_rate_value: parseFloat(item["applied_rate_value"]) || 0,
        heating_value: parseFloat(item["heating_value"]) || 0,
        heating_cost: parseFloat(item["heating_cost"]) || 0,
        water_heating_value: parseFloat(item["water_heating_value"]) || 0,
        water_heating_cost: parseFloat(item["water_heating_cost"]) || 0,
      })
      .then((r) => {
        if (r.data.success) {
          setPayments([r.data.item, ...payments]);
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .then(() => {
        setSelectedItem({});
        setModalsVisible({ ...modalsVisible, create: false });
      });
  };

  const deleteObjectPayment = async () => {
    axios
      .delete(`/api/v1/warmth/objects/${objectID}/payments/${selectedItem.id}`)
      .then((r) => {
        if (r.data.success) {
          setPayments(payments.filter((item) => item.id !== selectedItem.id));
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .then(() => {
        setSelectedItem({});
        setModalsVisible({ ...modalsVisible, delete: false });
      });
  };

  useEffect(() => {
    if (objectID) {
      getObjectsPayments();
    }
  }, [objectID]);

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <React.Fragment>
      <PageTitle>
        <Button
          text={"+ Добавить"}
          callback={() => {
            setSelectedItem({});
            setModalsVisible({ ...modalsVisible, create: true });
          }}
        />
      </PageTitle>
      <div>
        <table
          style={{ width: "80%", margin: "0 auto", borderSpacing: "0px 10px" }}
        >
          <thead>
            <tr>
              <th>Месяц</th>
              <th>Год</th>
              <th>Вид</th>
              <th>Тариф</th>
              <th>Отопление/Гкал</th>
              <th>Отопление/Рубли</th>
              <th>ГВС/Гкал</th>
              <th>ГВС/Рубли</th>
              <th></th>
            </tr>
          </thead>
          <tbody style={{ textAlign: "center" }}>
            {payments.map((obj) => (
              <tr key={obj.id}>
                <td>{obj.month}</td>
                <td>{obj.year}</td>
                <td>{obj.payment_type == 3 ? "поправки" : "основной"}</td>
                <td>{obj.applied_rate_value}</td>
                <td>{obj.heating_value}</td>
                <td>{obj.heating_cost}</td>
                <td>{obj.water_heating_value}</td>
                <td>{obj.water_heating_cost}</td>
                <td style={{ display: "flex", columnGap: "15px" }}>
                  <span
                    style={{
                      width: "20px",
                      height: "20px",
                      margin: "0 10px",
                      display: "block",
                      background: `url(${edit}) no-repeat center/100%`,
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setSelectedItem(obj);
                      setModalsVisible({ ...modalsVisible, create: true });
                    }}
                  />
                  <span
                    style={{
                      width: "20px",
                      height: "20px",
                      margin: "0 10px",
                      display: "block",
                      background: `url(${del}) no-repeat center/100%`,
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setSelectedItem(obj);
                      setModalsVisible({ ...modalsVisible, delete: true });
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Form
        isModal={true}
        closeModal={() => setModalsVisible({ ...modalsVisible, create: false })}
        modalVisible={modalsVisible.create}
        component={
          <PaymentForm
            objectID={objectID}
            selectedItem={selectedItem}
            onCreate={createObjectPayment}
            onUpdate={updateObjectPayment}
          />
        }
      />
      <ConfirmModal
        message={"Удалить?"}
        isVisible={modalsVisible.delete}
        onConfirm={deleteObjectPayment}
        closeModal={() => {
          setSelectedItem({});
          setModalsVisible({ ...modalsVisible, delete: false });
        }}
      />
    </React.Fragment>
  );
};

export default ObjectPayments;
