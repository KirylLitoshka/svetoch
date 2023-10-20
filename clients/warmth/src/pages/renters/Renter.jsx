import React, { useEffect, useState } from "react";
import ErrorMessage from "../../components/ui/messages/ErrorMessage";
import Loader from "../../components/ui/loader/Loader";
import PageTitle from "../../components/ui/title/PageTitle";
import Button from "../../components/ui/buttons/base/Button";
import axios from "axios";
import Accordion from "../../components/wrappers/accordion/Accordion";
import AccordionItem from "../../components/ui/accordion/AccordionItem";
import ConfirmModal from "../../components/modals/confirm/ConfirmModal";
import Form from "../../components/ui/form/Form";
import RenterForm from "../../forms/renter/RenterForm";
import RenterSearch from "../../forms/renter/RenterSearch";
import { useRenters } from "../../hooks/useRenters";
import RenterObjects from "./RenterObjects";
import { useNavigate } from "react-router-dom";

const Renter = () => {
  const navigate = useNavigate();
  const [renters, setRenters] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalsVisible, setModalsVisible] = useState({
    create: false,
    delete: false,
    view: false,
  });
  const [searchQuery, setSearchQuery] = useState({
    title: "",
    registration_number: "",
    is_closed: false,
  });

  const filteredRenters = useRenters(renters, searchQuery);
  const controls = [
    {
      label: "История начисления",
      callback: (item) => {
        navigate("payments", { state: { item: item } });
      },
    },
    {
      label: "Объекты",
      callback: (item) => {
        setSelectedItem(item);
        setModalsVisible({ ...modalsVisible, view: true });
      },
    },
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

  const getRentersItems = async () => {
    axios
      .get("/api/v1/warmth/renters")
      .then((r) => {
        if (r.data.success) {
          setRenters(r.data.items);
        } else {
          setError(r.response.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .then(() => setLoading(false));
  };

  const deleteRenterItem = async (item) => {
    axios
      .delete(`/api/v1/warmth/renters/${item.id}`)
      .then((r) => {
        if (r.data.success) {
          setRenters(renters.filter((rent) => rent.id !== item.id));
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .finally(() => {
        setModalsVisible({ ...modalsVisible, delete: false });
        setSelectedItem({});
      });
  };

  const createRenterItem = async (item) => {
    axios
      .post("/api/v1/warmth/renters", {
        ...item,
        heating_load: +item.heating_load || null,
        water_heating_load: +item.water_heating_load || null,
      })
      .then((r) => {
        if (r.data.success) {
          setRenters([...renters, r.data.item]);
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .finally(() => {
        setModalsVisible({ ...modalsVisible, create: false });
        setSelectedItem({});
      });
  };

  const updateRenterItem = async (item) => {
    axios
      .patch(`/api/v1/warmth/renters/${item.id}`, {
        ...item,
        heating_load: +item.heating_load || null,
        water_heating_load: +item.water_heating_load || null,
      })
      .then((r) => {
        if (r.data.success) {
          setRenters(
            renters.map((renter) => (renter.id === item.id ? item : renter))
          );
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .finally(() => {
        setModalsVisible({ ...modalsVisible, create: false });
        setSelectedItem({});
      });
  };

  useEffect(() => {
    getRentersItems();
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
            setSelectedItem({});
            setModalsVisible({ ...modalsVisible, create: true });
          }}
        />
      </PageTitle>
      <RenterSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <Accordion>
        {filteredRenters.map((renter) => (
          <AccordionItem
            key={renter.id}
            title={renter.name}
            controls={controls.map((control) => ({ ...control, item: renter }))}
          >
            <div>Наименование: {renter.full_name}</div>
            <div>Расчетный счет: {renter.checking_account || "Не указан"}</div>
            <div>УНП: {renter.registration_number || "Не указан"}</div>
            <div>ОКПО: {renter.respondent_number || "Не указан"}</div>
            <div>Номер договора: {renter.contract_number || "Не указан"}</div>
            <div>
              Дата заключения договора: {renter.contract_date || "Не указана"}
            </div>
            <div>Адрес: {renter.address || "Не указан"}</div>
            <div>Контакты: {renter.contacts || "Не указаны"}</div>
            <div>Банк: {renter?.bank.title || "Не указан"}</div>
            <div>Отопление: {renter.is_heating_available ? "Да" : "Нет"}</div>
            <div>
              Нагрузка на отопление: {renter.heating_load || "Не указан"}
            </div>
            <div>ГВС: {renter.is_water_heating_avalailable ? "Да" : "Нет"}</div>
            <div>
              Нагрузка на ГВС: {renter.water_heating_load || "Не указан"}
            </div>
            <div>
              Бюджетная организация: {renter.is_public_sector ? "Да" : "Нет"}
            </div>
            <div>Закрыт: {renter.is_closed ? "Да" : "Нет"}</div>
          </AccordionItem>
        ))}
      </Accordion>
      <ConfirmModal
        isVisible={modalsVisible.delete}
        message={"Удалить ?"}
        onConfirm={() => deleteRenterItem(selectedItem)}
        closeModal={() => {
          setModalsVisible({ ...modalsVisible, delete: false });
          setSelectedItem({});
        }}
      />
      <Form
        isModal={true}
        modalVisible={modalsVisible.create}
        component={
          <RenterForm
            selectedItem={selectedItem}
            onCreate={createRenterItem}
            onUpdate={updateRenterItem}
          />
        }
        closeModal={() => {
          setModalsVisible({ ...modalsVisible, create: false });
          setSelectedItem({});
        }}
      />
      <RenterObjects
        isVisible={modalsVisible.view}
        selectedItem={selectedItem}
        closeModal={() => {
          setSelectedItem({});
          setModalsVisible({ ...modalsVisible, view: false });
        }}
      />
    </React.Fragment>
  );
};

export default Renter;
