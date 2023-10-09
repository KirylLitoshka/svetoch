import React, { useEffect, useState } from "react";
import ErrorMessage from "../../components/ui/messages/ErrorMessage";
import Loader from "../../components/ui/loader/Loader";
import axios from "axios";
import PageTitle from "../../components/ui/title/PageTitle";
import Button from "../../components/ui/buttons/base/Button";
import Accordion from "../../components/wrappers/accordion/Accordion";
import AccordionItem from "../../components/ui/accordion/AccordionItem";
import { useNavigate } from "react-router-dom";
import { months } from "../../utils/date";
import ConfirmModal from "../../components/modals/confirm/ConfirmModal";
import Form from "../../components/ui/form/Form";
import RateForm from "../../forms/rate/RateForm";

const Rate = () => {
  const navigate = useNavigate();
  const [rateItems, setRateItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState({
    create: false,
    delete: false,
  });

  const rateItemControl = [
    {
      label: "История",
      callback: (rateItem) => {
        navigate("/catalogues/rates/history", {
          state: { rateItem: rateItem },
        });
      },
    },
    {
      label: "Изменить",
      callback: (rateItem) => {
        setSelectedItem(rateItem);
        setModalVisible({ ...modalVisible, create: true });
      },
    },
    {
      label: "Удалить",
      callback: (rateItem) => {
        setSelectedItem(rateItem);
        setModalVisible({ ...modalVisible, delete: true });
      },
    },
  ];

  const getRateItems = async () => {
    axios
      .get("/api/v1/warmth/rates")
      .then((r) => {
        if (r.data.success) {
          setRateItems(r.data.items);
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .finally(() => setLoading(false));
  };

  const createRateItem = async (rateItem) => {
    axios
      .post("/api/v1/warmth/rates", rateItem)
      .then((r) => {
        if (r.data.success) {
          setRateItems([r.data.item, ...rateItems]);
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .finally(() => {
        setModalVisible({ ...modalVisible, create: false });
        setSelectedItem(null);
      });
  };

  const deleteRateItem = async (rateItem) => {
    axios
      .delete(`/api/v1/warmth/rates/${rateItem.id}`)
      .then((r) => {
        if (r.data.success) {
          setRateItems(rateItems.filter((item) => item.id !== rateItem.id));
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .finally(() => {
        setModalVisible({ ...modalVisible, delete: false });
        setSelectedItem(null);
      });
  };

  const updateRateItem = async (rateItem) => {
    axios
      .patch(`/api/v1/warmth/rates/${rateItem.id}`, {
        id: selectedItem.id,
        title: selectedItem.title,
        is_currency_coefficient_applied:
          selectedItem.is_currency_coefficient_applied,
      })
      .then((r) => {
        if (r.data.success) {
          setRateItems(
            rateItems.map((item) => (item.id === rateItem.id ? rateItem : item))
          );
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .finally(() => {
        setModalVisible({ ...modalVisible, create: false });
        setSelectedItem(null);
      });
  };

  useEffect(() => {
    getRateItems();
  }, []);

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
            setSelectedItem(null);
            setModalVisible({ ...modalVisible, create: true });
          }}
        />
      </PageTitle>
      <Accordion>
        {rateItems.map((rate) => (
          <AccordionItem
            key={rate.id}
            title={rate.title}
            controls={rateItemControl.map((control) => ({
              ...control,
              item: rate,
            }))}
          >
            {rate.history && (
              <React.Fragment>
                <div>
                  Дата установки тарифа: {months[rate.history.month - 1]}{" "}
                  {rate.history.year}
                </div>
                <div>Тариф 1: {rate.history.value_1 || 0}</div>
                <div>Тариф 2: {rate.history.value_2 || 0}</div>
              </React.Fragment>
            )}

            <div>
              Применение валютного коэффициента:{" "}
              {rate.is_currency_coefficient_applied ? "Да" : "Нет"}
            </div>
          </AccordionItem>
        ))}
      </Accordion>
      <ConfirmModal
        message={"Удалить?"}
        isVisible={modalVisible.delete}
        onConfirm={() => deleteRateItem(selectedItem)}
        closeModal={() => {
          setModalVisible({ ...modalVisible, delete: false });
          setSelectedItem(null);
        }}
      />
      <Form
        isModal={true}
        modalVisible={modalVisible.create}
        component={
          <RateForm
            selectedItem={selectedItem}
            onCreate={createRateItem}
            onUpdate={updateRateItem}
          />
        }
        closeModal={() => {
          setSelectedItem(null);
          setModalVisible({ ...modalVisible, create: false });
        }}
      />
    </React.Fragment>
  );
};

export default Rate;
