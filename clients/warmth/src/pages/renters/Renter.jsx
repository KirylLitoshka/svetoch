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
import RentersSelection from "./RentersSelection";

const Renter = () => {
  const navigate = useNavigate();
  const [renters, setRenters] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedRentersIDs, setSelectedRentersIDs] = useState([]);
  const [reportType, setReportType] = useState("");
  const [modalsVisible, setModalsVisible] = useState({
    create: false,
    delete: false,
    view: false,
    selection: false,
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

  const getRentersReport = async () => {
    if (selectedRentersIDs.length === 0) {
      return;
    }
    setModalsVisible({ ...modalsVisible, selection: false });
    const URLString = selectedRentersIDs
      .map((value, index) => `arr[${index}]=${value}`)
      .join("&");
    axios
      .get(`/api/v1/warmth/reports/files/${reportType}?${URLString}`, {
        responseType: "arraybuffer",
      })
      .then((r) => {
        if (r.status === 200 && r.headers["content-disposition"]) {
          const filename =
            r.headers["content-disposition"].split("filename=")[1];
          const url = URL.createObjectURL(new Blob([r.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", filename);
          link.click();
        } else {
          setError(r.data.reason);
          setModalsVisible({ ...modalsVisible, selection: false });
        }
      })
      .catch((e) => setError(e.response.data.reason));
    setSelectedRentersIDs([]);
  };

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
        <Button
          text={"ЭСЧФ"}
          callback={() => {
            setModalsVisible({ ...modalsVisible, selection: true });
            setReportType("renter_invoice");
          }}
        />
        <Button
          text={"Счет фактуры"}
          callback={() => {
            setModalsVisible({ ...modalsVisible, selection: true });
            setReportType("renter_invoice_print");
          }}
        />
      </PageTitle>
      <RenterSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <Accordion>
        {filteredRenters.map((renter) => (
          <AccordionItem
            key={renter.id}
            title={renter.id + ". " + renter.name}
            controls={controls.map((control) => ({ ...control, item: renter }))}
          >
            <div>Наименование: {renter.full_name}</div>
            <div>Почта: {renter.email || "Не указана"}</div>
            <div>Расчетный счет: {renter.banking_account || "Не указан"}</div>
            <div>УНП: {renter.registration_number || "Не указан"}</div>
            <div>ОКПО: {renter.respondent_number || "Не указан"}</div>
            <div>Номер договора: {renter.contract_number || "Не указан"}</div>
            <div>
              Дата заключения договора: {renter.contract_date || "Не указана"}
            </div>
            <div>Адрес: {renter.address || "Не указан"}</div>
            <div>Контакты: {renter.contacts || "Не указаны"}</div>
            <div>Банк: {renter?.bank?.title || "Не указан"}</div>
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
      <RentersSelection
        rentersList={renters.filter((renter) => !renter.is_closed)}
        isVisible={modalsVisible.selection}
        onClose={() => {
          setSelectedRentersIDs([]);
          setModalsVisible({ ...modalsVisible, selection: false });
        }}
        selectedIDs={selectedRentersIDs}
        setSelectedIDs={setSelectedRentersIDs}
        confirmCallback={getRentersReport}
      />
    </React.Fragment>
  );
};

export default Renter;
