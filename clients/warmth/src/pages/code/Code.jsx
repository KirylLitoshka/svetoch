import axios from "axios";
import React, { useEffect, useState } from "react";
import ErrorMessage from "../../components/ui/messages/ErrorMessage";
import Loader from "../../components/ui/loader/Loader";
import PageTitle from "../../components/ui/title/PageTitle";
import Button from "../../components/ui/buttons/base/Button";
import Accordion from "../../components/wrappers/accordion/Accordion";
import AccordionItem from "../../components/ui/accordion/AccordionItem";
import ConfirmModal from "../../components/modals/confirm/ConfirmModal";
import Form from "../../components/ui/form/Form";
import CodeForm from "../../forms/code/CodeForm";

const Code = () => {
  const [codeItems, setCodeItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalsVisible, setModalsVisible] = useState({
    delete: false,
    create: false,
  });

  const controls = [
    {
      label: "Изменить",
      callback: (item) => {
        setSelectedItem(item);
        setModalsVisible({ ...modalsVisible, create: true });
      },
    },
    {
      label: "Удалить",
      callback: (item) => {
        setSelectedItem(item);
        setModalsVisible({ ...modalsVisible, delete: true });
      },
    },
  ];

  const getCodeItems = async () => {
    axios
      .get("/api/v1/warmth/reconciliation_codes")
      .then((r) => {
        if (r.data.success) {
          setCodeItems(r.data.items);
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .finally(() => setLoading(false));
  };

  const deleteCodeItem = async (item) => {
    axios
      .delete(`/api/v1/warmth/reconciliation_codes/${item.id}`)
      .then((r) => {
        if (r.data.success) {
          setCodeItems(codeItems.filter((codeItem) => codeItem.id !== item.id));
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .finally(() => {
        setSelectedItem(null);
        setModalsVisible({ ...modalsVisible, delete: false });
      });
  };

  const createCodeItem = async (item) => {
    axios
      .post("/api/v1/warmth/reconciliation_codes", item)
      .then((r) => {
        if (r.data.success) {
          setCodeItems([...codeItems, r.data.item]);
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .finally(() => {
        setSelectedItem(null);
        setModalsVisible({ ...modalsVisible, create: false });
      });
  };

  const updateCodeItem = async (item) => {
    axios
      .patch(`/api/v1/warmth/reconciliation_codes/${item.id}`, item)
      .then((r) => {
        if (r.data.success) {
          setCodeItems(
            codeItems.map((codeItem) =>
              codeItem.id === item.id ? item : codeItem
            )
          );
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .finally(() => {
        setSelectedItem(null);
        setModalsVisible({ ...modalsVisible, create: false });
      });
  };

  useEffect(() => {
    getCodeItems();
  }, []);

  if (error) {
    <ErrorMessage message={error} />;
  }

  if (loading) {
    <Loader />;
  }

  return (
    <React.Fragment>
      <PageTitle>
        <Button
          text={"+ Добавить"}
          callback={() => {
            setSelectedItem(null);
            setModalsVisible({ ...modalsVisible, create: true });
          }}
        />
      </PageTitle>
      <Accordion>
        {codeItems.map((item) => (
          <AccordionItem
            key={item.id}
            title={item.title}
            controls={controls.map((control) => ({ ...control, item: item }))}
          />
        ))}
      </Accordion>
      <ConfirmModal
        message={"Удалить?"}
        isVisible={modalsVisible.delete}
        onConfirm={() => deleteCodeItem(selectedItem)}
        closeModal={() => {
          setSelectedItem(null);
          setModalsVisible({ ...modalsVisible, delete: false });
        }}
      />
      <Form
        isModal={true}
        closeModal={() => setModalsVisible({ ...modalsVisible, create: false })}
        modalVisible={modalsVisible.create}
        component={
          <CodeForm
            selectedItem={selectedItem}
            onCreate={createCodeItem}
            onUpdate={updateCodeItem}
          />
        }
      />
    </React.Fragment>
  );
};

export default Code;
