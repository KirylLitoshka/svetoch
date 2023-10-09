import React, { useEffect, useState } from "react";
import PageTitle from "../../components/ui/title/PageTitle";
import ErrorMessage from "../../components/ui/messages/ErrorMessage";
import Loader from "../../components/ui/loader/Loader";
import Button from "../../components/ui/buttons/base/Button";
import Accordion from "../../components/wrappers/accordion/Accordion";
import axios from "axios";
import AccordionItem from "../../components/ui/accordion/AccordionItem";
import ConfirmModal from "../../components/modals/confirm/ConfirmModal";
import Form from "../../components/ui/form/Form";
import BankForm from "../../forms/bank/BankForm";

const Bank = () => {
  const [bankItems, setBankItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBankItem, setSelectedBankItem] = useState(null);
  const [modalVisible, setModalVisible] = useState({
    delete: false,
    create: false,
  });

  const getBankItems = async () => {
    axios
      .get("/api/v1/warmth/banks")
      .then((r) => {
        if (r.data.success) {
          setBankItems(r.data.items);
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason));
  };

  const createBankItem = async (bankItem) => {
    axios
      .post("/api/v1/warmth/banks", bankItem)
      .then((r) => {
        if (r.data.success) {
          setBankItems([...bankItems, r.data.item]);
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .finally(() => {
        setSelectedBankItem(null);
        setModalVisible({ ...modalVisible, create: false });
      });
  };

  const deleteBankItem = async (bankItem) => {
    axios
      .delete(`/api/v1/warmth/banks/${bankItem.id}`)
      .then((r) => {
        if (r.data.success) {
          setBankItems(bankItems.filter((item) => item.id !== bankItem.id));
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .finally(() => {
        setModalVisible({ ...modalVisible, delete: false });
        setSelectedBankItem(null);
      });
  };

  const updateBankItem = async (bankItem) => {
    axios
      .patch(`/api/v1/warmth/banks/${bankItem.id}`, bankItem)
      .then((r) => {
        if (r.data.success) {
          setBankItems(
            bankItems.map((item) => (item.id === bankItem.id ? bankItem : item))
          );
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .finally(() => {
        setModalVisible({ ...modalVisible, create: false });
        setSelectedBankItem(null);
      });
  };

  const bankItemControls = [
    {
      label: "Изменить",
      callback: (bankItem) => {
        setSelectedBankItem(bankItem);
        setModalVisible({ ...modalVisible, create: true });
      },
    },
    {
      label: "Удалить",
      callback: (bankItem) => {
        setSelectedBankItem(bankItem);
        setModalVisible({ ...modalVisible, delete: true });
      },
    },
  ];

  useEffect(() => {
    getBankItems().then(() => setLoading(false));
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
          callback={() => setModalVisible({ ...modalVisible, create: true })}
        />
      </PageTitle>
        <Accordion>
          {bankItems.map((bank) => (
            <AccordionItem
              key={bank.id}
              title={bank.title}
              controls={bankItemControls.map((control) => ({
                ...control,
                item: bank,
              }))}
            >
              <div>Код шифра: {bank.code}</div>
            </AccordionItem>
          ))}
        </Accordion>
      <ConfirmModal
        message={"Удалить?"}
        isVisible={modalVisible.delete}
        onConfirm={() => deleteBankItem(selectedBankItem)}
        closeModal={() => {
          setModalVisible({ ...modalVisible, delete: false });
          setSelectedBankItem(null);
        }}
      />
      <Form
        isModal={true}
        modalVisible={modalVisible.create}
        closeModal={() => {
          setModalVisible({ ...modalVisible, create: false });
          setSelectedBankItem(null)
        }}
        component={
          <BankForm
            selectedItem={selectedBankItem}
            onCreate={createBankItem}
            onUpdate={updateBankItem}
          />
        }
      />
    </React.Fragment>
  );
};

export default Bank;
