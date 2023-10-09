import React, { useState, useEffect } from "react";
import Loader from "../../components/ui/loader/Loader";
import ErrorMessage from "../../components/ui/messages/ErrorMessage";
import axios from "axios";
import { useLocation } from "react-router-dom";
import PageTitle from "../../components/ui/title/PageTitle";
import Button from "../../components/ui/buttons/base/Button";
import Accordion from "../../components/wrappers/accordion/Accordion";
import AccordionItem from "../../components/ui/accordion/AccordionItem";
import { months } from "../../utils/date";
import ConfirmModal from "../../components/modals/confirm/ConfirmModal";
import Form from "../../components/ui/form/Form";
import RateHistoryForm from "../../forms/rate/RateHistoryForm";

const RateHistory = () => {
  const location = useLocation();
  const rateID = location.state.rateItem.id;
  const [rateHistoryItems, setRateHistoryItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState({
    delete: false,
    create: false,
  });

  const rateHistoryItemControls = [
    {
      label: "Изменить",
      callback: (rateHistoryItem) => {
        console.log(rateHistoryItem)
        setSelectedItem(rateHistoryItem);
        setModalVisible({ ...modalVisible, create: true });
      },
    },
    {
      label: "Удалить",
      callback: (rateHistoryItem) => {
        setSelectedItem(rateHistoryItem);
        setModalVisible({ ...modalVisible, delete: true });
      },
    },
  ];

  const getRateHistoryItems = async () => {
    axios
      .get(`/api/v1/warmth/rates/${rateID}/history`)
      .then((r) => {
        if (r.data.success) {
          setRateHistoryItems(r.data.items);
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .then(() => setLoading(false));
  };

  const deleteRateHistoryItem = async (item) => {
    console.log(selectedItem)
    axios
      .delete(`/api/v1/warmth/rates/${rateID}/history/${item.id}`)
      .then((r) => {
        if (r.data.success) {
          setRateHistoryItems(
            rateHistoryItems.filter((rateItem) => rateItem.id !== item.id)
          );
        } else {
          setError(r.data.reaso);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .finally(() => {
        setSelectedItem(null);
        setModalVisible({ ...modalVisible, delete: false });
      });
  };

  const createRateHistoryItem = async (item) => {
    axios
      .post(`/api/v1/warmth/rates/${rateID}/history`, {
        ...item,
        rate_id: rateID,
      })
      .then((r) => {
        if (r.data.success) {
          rateHistoryItems.unshift(r.data.item)
          setRateHistoryItems([...rateHistoryItems]);
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .finally(() => {
        setSelectedItem(null);
        setModalVisible({ ...modalVisible, create: false });
      });
  };

  const updateRateHistoryItem = async (item) => {
    axios
      .patch(`/api/v1/warmth/rates/${rateID}/history/${item.id}`, item)
      .then((r) => {
        if (r.data.success) {
          setRateHistoryItems(
            rateHistoryItems.map((rHistoryItem) =>
              rHistoryItem.id === item.id ? item : rHistoryItem
            )
          );
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .finally(() => {
        setSelectedItem(null);
        setModalVisible({ ...modalVisible, create: false });
      });
  };

  useEffect(() => {
    getRateHistoryItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
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
        {rateHistoryItems.map((item) => (
          <AccordionItem
            key={item.id}
            title={months[item.month - 1] + " " + item.year}
            controls={rateHistoryItemControls.map((control) => ({
              ...control,
              item: item,
            }))}
          >
            <div>Тариф 1: {item.value_1 || 0}</div>
            <div>Тариф 2: {item.value_2 || 0}</div>
          </AccordionItem>
        ))}
      </Accordion>
      <ConfirmModal
        isVisible={modalVisible.delete}
        message={"Удалить?"}
        onConfirm={() => deleteRateHistoryItem(selectedItem)}
        closeModal={() => {
          setSelectedItem(null);
          setModalVisible({ ...modalVisible, delete: false });
        }}
      />
      <Form
        isModal={true}
        modalVisible={modalVisible.create}
        closeModal={() => {
          setModalVisible({ ...modalVisible, create: false });
          setSelectedItem(null);
        }}
        component={
          <RateHistoryForm
            onCreate={createRateHistoryItem}
            onUpdate={updateRateHistoryItem}
            selectedItem={selectedItem}
          />
        }
      />
    </React.Fragment>
  );
};

export default RateHistory;
