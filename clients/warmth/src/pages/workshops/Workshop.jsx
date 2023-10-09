import React, { useEffect, useState } from "react";
import ErrorMessage from "../../components/ui/messages/ErrorMessage";
import Loader from "../../components/ui/loader/Loader";
import PageTitle from "../../components/ui/title/PageTitle";
import Button from "../../components/ui/buttons/base/Button";
import Accordion from "../../components/wrappers/accordion/Accordion";
import AccordionItem from "../../components/ui/accordion/AccordionItem";
import Form from "../../components/ui/form/Form";
import ConfirmModal from "../../components/modals/confirm/ConfirmModal";
import axios from "axios";
import WorkshopForm from "../../forms/workshop/WorkshopForm";

const Workshop = () => {
  const [workshopItems, setWorkshopItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState({
    create: false,
    delete: false,
  });
  const workshopControls = [
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

  const getWorkshopItems = async () => {
    axios
      .get("/api/v1/warmth/workshops")
      .then((r) => {
        if (r.data.success) {
          setWorkshopItems(r.data.items);
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .finally(() => setLoading(false));
  };

  const createWorkshopItem = async (item) => {
    axios
      .post("/api/v1/warmth/workshops", item)
      .then((r) => {
        if (r.data.success) {
          setWorkshopItems([...workshopItems, r.data.item]);
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

  const updateWorkshopItems = async (item) => {
    axios
      .patch(`/api/v1/warmth/workshops/${item.id}`, item)
      .then((r) => {
        if (r.data.success) {
          setWorkshopItems(
            workshopItems.map((workshop) =>
              workshop.id === item.id ? item : workshop
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

  const deleteWorkshopItem = async (item) => {
    axios
      .delete(`/api/v1/warmth/workshops/${item.id}`)
      .then((r) => {
        if (r.data.success) {
          setWorkshopItems(
            workshopItems.filter((workshop) => workshop.id !== item.id)
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

  useEffect(() => {
    getWorkshopItems();
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
        {workshopItems.map((item) => (
          <AccordionItem
            key={item.id}
            title={item.title}
            controls={workshopControls.map((control) => ({
              ...control,
              item: item,
            }))}
          />
        ))}
      </Accordion>
      <Form
        isModal={true}
        modalVisible={modalVisible.create}
        component={
          <WorkshopForm
            selectedItem={selectedItem}
            onCreate={createWorkshopItem}
            onUpdate={updateWorkshopItems}
          />
        }
        closeModal={() => {
          setSelectedItem(null);
          setModalVisible({ ...modalVisible, create: false });
        }}
      />
      <ConfirmModal
        message={"Удалить?"}
        isVisible={modalVisible.delete}
        onConfirm={() => deleteWorkshopItem(selectedItem)}
        closeModal={() => {
          setSelectedItem(null);
          setModalVisible({ ...modalVisible, delete: false });
        }}
      />
    </React.Fragment>
  );
};

export default Workshop;
