import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorMessage from "../../components/ui/messages/ErrorMessage";
import Loader from "../../components/ui/loader/Loader";
import PageTitle from "../../components/ui/title/PageTitle";
import Button from "../../components/ui/buttons/base/Button";
import Accordion from "../../components/wrappers/accordion/Accordion";
import AccordionItem from "../../components/ui/accordion/AccordionItem";
import Pagination from "../../components/ui/pagination/Pagination";
import { useObjects } from "../../hooks/useObjects";
import ObjectSearch from "../../forms/object/ObjectSearch";
import ConfirmModal from "../../components/modals/confirm/ConfirmModal";
import Form from "../../components/ui/form/Form";
import ObjectForm from "../../forms/object/ObjectForm";
import PaymentsUploadForm from "../../forms/payment/PaymentsUploadForm";
import PaymentForm from "../../forms/payment/PaymentForm";

const Object = () => {
  const navigate = useNavigate();
  const [objectItems, setObjectItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState({ title: "", code: "", is_closed: false });
  const [modalsVisible, setModalsVisible] = useState({
    delete: false,
    create: false,
    fee: false,
    payment: false
  });

  const filteredObjects = useObjects(objectItems, searchQuery);

  const PER_PAGE = 25;
  const offset = currentPage * PER_PAGE;
  const currentPageData = filteredObjects.slice(offset, offset + PER_PAGE);
  const pageCount = Math.ceil(filteredObjects.length / PER_PAGE);

  const controls = [
    {
      label: "Начислить",
      callback: (item) => {
        setSelectedItem(item);
        setModalsVisible({...modalsVisible, payment: true})
      }
    },
    {
      label: "История начислений",
      callback: (item) =>
        navigate("payments", { state: { objectID: item.id } }),
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

  useEffect(() => {
    getObjectItems();
  }, []);

  const handlePageClick = ({ selected: selectedPage }) => {
    setCurrentPage(selectedPage);
  };

  const getObjectItems = async () => {
    axios
      .get("/api/v1/warmth/objects")
      .then((r) => {
        if (r.data.success) {
          setObjectItems(r.data.items);
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .then(() => setLoading(false));
  };

  const deleteObjectItem = async (item) => {
    axios
      .delete(`/api/v1/warmth/objects/${item.id}`)
      .then((r) => {
        if (r.data.success) {
          setObjectItems(objectItems.filter((obj) => obj.id !== item.id));
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

  const createObjectItem = async (item) => {
    axios
      .post("/api/v1/warmth/objects", item)
      .then((r) => {
        if (r.data.success) {
          objectItems.push(r.data.item)
          objectItems.sort((a, b) => {return a.code - b.code})
          setObjectItems([...objectItems]);
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .finally(() => {
        setSelectedItem({});
        setModalsVisible({ ...modalsVisible, create: false });
      });
  };

  const updateObjectItem = async (item) => {
    axios
      .patch(`/api/v1/warmth/objects/${item.id}`, item)
      .then((r) => {
        if (r.data.success) {
          setObjectItems(
            objectItems.map((obj) => (obj.id === item.id ? item : obj)).sort((a, b) => {return a.code - b.code})
          );
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .finally(() => {
        setSelectedItem({});
        setModalsVisible({ ...modalsVisible, create: false });
      });
  };

  const createObjectPayment = async (item) => {
    axios
      .post(`/api/v1/warmth/objects/${selectedItem.id}/payments`, {
        ...item,
        object_id: selectedItem.id,
        applied_rate_value: parseFloat(item.applied_rate_value) || 0,
        heating_value: parseFloat(item.heating_value) || 0,
        heating_cost: parseFloat(item.heating_cost) || 0,
        water_heating_value: parseFloat(item.water_heating_value) || 0,
        water_heating_cost: parseFloat(item.water_heating_cost) || 0,
        additional_coefficient_value: parseFloat(item.additional_coefficient_value) || null
      })
      .then((r) => {
        if (!r.data.success) {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .then(() => {
        setSelectedItem({});
        setModalsVisible({ ...modalsVisible, payment: false });
      });
  };

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
          text={"Начисления"}
          callback={() => setModalsVisible({ ...modalsVisible, fee: true })}
        />
        <Button
          text={"+ Добавить"}
          callback={() => {
            setSelectedItem({});
            setModalsVisible({ ...modalsVisible, create: true });
          }}
        />
      </PageTitle>
      <ObjectSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <Accordion>
        {currentPageData.map((obj) => (
          <AccordionItem
            key={obj.id}
            title={`${obj.code}. ${obj.title}`}
            controls={controls.map((control) => ({ ...control, item: obj }))}
          >
            <div>
              Стутас объекта: {obj.is_closed ? "Закрыт" : "Действителен"}
            </div>
            <div>НДС: {obj.vat}%</div>
            <div>Тариф: {obj?.rate ? obj.rate.title : "Не указан"}</div>
            <div>Цех: {obj?.workshop ? obj.workshop.title : "Не указан"}</div>
            <div>
              Код сверки:{" "}
              {obj?.reconciliation_code
                ? obj.reconciliation_code.title
                : "Не указан"}
            </div>
            {obj.is_meter_unavailable ? (
              <div style={{ color: "red" }}>Объект без прибора учета</div>
            ) : (
              ""
            )}
          </AccordionItem>
        ))}
      </Accordion>
      <Pagination pageCount={pageCount} handlePageClick={handlePageClick} />
      <ConfirmModal
        isVisible={modalsVisible.delete}
        message={"Удалить?"}
        onConfirm={() => deleteObjectItem(selectedItem)}
        closeModal={() => {
          setSelectedItem({});
          setModalsVisible({ ...modalsVisible, delete: false });
        }}
      />
      <Form
        isModal={true}
        modalVisible={modalsVisible.create}
        component={
          <ObjectForm
            selectedItem={selectedItem}
            onCreate={createObjectItem}
            onUpdate={updateObjectItem}
          />
        }
        closeModal={() => {
          setSelectedItem({});
          setModalsVisible({ ...modalsVisible, create: false });
        }}
      />
      <Form
        isModal={true}
        modalVisible={modalsVisible.fee}
        component={<PaymentsUploadForm isVisible={modalsVisible.fee} />}
        closeModal={() => setModalsVisible({ ...modalsVisible, fee: false })}
      />
      <Form
        isModal={true}
        modalVisible={modalsVisible.payment}
        component={<PaymentForm onCreate={createObjectPayment} />}
        closeModal={() => setModalsVisible({ ...modalsVisible, payment: false })}
      />
    </React.Fragment>
  );
};

export default Object;
