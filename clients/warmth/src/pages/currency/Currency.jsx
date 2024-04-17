import axios from "axios";
import React, { useEffect, useState } from "react";
import Loader from "../../components/ui/loader/Loader";
import ErrorMessage from "../../components/ui/messages/ErrorMessage";
import PageTitle from "../../components/ui/title/PageTitle";
import Button from "../../components/ui/buttons/base/Button";
import Accordion from "../../components/wrappers/accordion/Accordion";
import AccordionItem from "../../components/ui/accordion/AccordionItem";
import { months } from "../../utils/date";
import ConfirmModal from "../../components/modals/confirm/ConfirmModal";
import Form from "../../components/ui/form/Form";
import CurrencyForm from "../../forms/currency/CurrencyForm";

const Currency = () => {
  const [currencyItems, setCurrencyItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState({
    delete: false,
    create: false,
  });

  const currencyControls = [
    {
      label: "Изменить",
      callback: (item) => {
        setSelectedItem(item);
        setModalVisible({ ...modalVisible, create: true });
      },
    },
    {
      label: "Удалить",
      callback: (item) => {
        setSelectedItem(item);
        setModalVisible({ ...modalVisible, delete: true });
      },
    },
  ];

  const getCurrencyItems = async () => {
    axios
      .get("/api/v1/warmth/currency_coefficients")
      .then((r) => {
        if (r.data.success) {
          setCurrencyItems(r.data.items);
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .finally(() => setLoading(false));
  };

  const deleteCurrencyItem = async (item) => {
    axios
      .delete(`/api/v1/warmth/currency_coefficients/${item.id}`)
      .then((r) => {
        if (r.data.success) {
          setCurrencyItems(
            currencyItems.filter((currency) => currency.id !== item.id)
          );
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .finally(() => {
        setSelectedItem(null);
        setModalVisible({ ...modalVisible, delete: false });
      });
  };

  const updateCurrencyItem = async (item) => {
    axios
      .patch(`/api/v1/warmth/currency_coefficients/${item.id}`, {
        ...item, 
        value_1: parseFloat(item.value_1) || 0,
        value_2: parseFloat(item.value_2) || 0
      })
      .then((r) => {
        if (r.data.success) {
          setCurrencyItems(
            currencyItems.map((currency) =>
              currency.id === item.id ? item : currency
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

  const createCurrencyItem = async (item) => {
    axios
      .post("/api/v1/warmth/currency_coefficients", {
        ...item, 
        value_1: parseFloat(item.value_1) || 0,
        value_2: parseFloat(item.value_2) || 0
      })
      .then((r) => {
        if (r.data.success) {
          setCurrencyItems([r.data.item, ...currencyItems]);
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
    getCurrencyItems();
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
        {currencyItems.map((item) => (
          <AccordionItem
            key={item.id}
            title={months[item.month - 1] + " " + item.year}
            controls={currencyControls.map((control) => ({
              ...control,
              item: item,
            }))}
          >
            <div>Коэффициент 1: {item.value_1 || 0}</div>
            <div>Коэффициент 2: {item.value_2 || 0}</div>
          </AccordionItem>
        ))}
      </Accordion>
      <ConfirmModal
        closeModal={() => {
          setSelectedItem(null);
          setModalVisible({ ...modalVisible, delete: false });
        }}
        isVisible={modalVisible.delete}
        message={"Удалить?"}
        onConfirm={() => deleteCurrencyItem(selectedItem)}
      />
      <Form
        isModal={true}
        modalVisible={modalVisible.create}
        component={
          <CurrencyForm
            selectedItem={selectedItem}
            onCreate={createCurrencyItem}
            onUpdate={updateCurrencyItem}
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

export default Currency;
