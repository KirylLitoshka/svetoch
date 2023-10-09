import React, { useEffect, useState } from "react";
import Loader from "../../components/ui/loader/Loader";
import Error from "../../components/ui/error/Error";
import PageTitle from "../../components/ui/title/PageTitle";
import Search from "../../components/ui/search/Search";
import Pagination from "../../components/ui/pagination/Pagination";
import Accordion from "../../components/ui/accordion/Accordion";
import ControlButton from "../../components/ui/buttons/controls/ControlButton";
import CatalogueControl from "../../components/ui/controls/catalogue/CatalogueControl";
import UserDate from "../../components/ui/date/Date";
import Confirm from "../../components/ui/modals/confirm/Confirm";
import ModalWrapper from "../../components/wrappers/modal/ModalWrapper";
import axios from "axios";
import { Link } from "react-router-dom";
import { useObjects } from "../../hooks/useObjects";
import { showContent } from "../../utils/accordion";
import { addressToString } from "../../utils/addresses";
import ObjectLimitsForm from "../../components/forms/objects/ObjectLimitsForm";

const Objects = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [objects, setObjects] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [limitsModalVisible, setLimitsModalVisible] = useState(false);
  const [selectedID, setSelectedID] = useState(null);
  const [searchQuery, setSearchQuery] = useState({
    title: "",
    meterNumber: "",
    status: "",
    countingPoint: "",
  });
  const filteredObjects = useObjects(objects, searchQuery);

  useEffect(() => {
    const getObjects = async () => {
      axios
        .get("/api/v1/electricity/objects")
        .then((r) => {
          if (r.data.success) {
            setObjects(r.data.items);
          } else {
            setError(r.data.reason);
          }
        })
        .catch((e) => setError(e.response.data.reason))
        .then(() => setLoading(false));
    };

    getObjects();
  }, []);

  const PER_PAGE = 25;
  const offset = currentPage * PER_PAGE;
  const currentPageData = filteredObjects.slice(offset, offset + PER_PAGE);
  const pageCount = Math.ceil(filteredObjects.length / PER_PAGE);

  const deleteObject = async () => {
    axios
      .delete(`/api/v1/electricity/objects/${selectedID}`)
      .then((r) => {
        if (r.data.success) {
          setObjects(objects.filter((item) => item.id !== selectedID));
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .then(() => setModalVisible(false));
  };

  const handlePageClick = ({ selected: selectedPage }) => {
    setCurrentPage(selectedPage);
  };

  const closeModal = (visible = false) => {
    setSelectedID(null);
    setLimitsModalVisible(visible);
  };

  if (loading) {
    return <Loader />;
  }
  if (error) {
    return <Error message={error} />;
  }

  return (
    <React.Fragment>
      <PageTitle>
        <Link to="payment" className="page-main__button" state={{objects: objects}}>
          Начисления
        </Link>
        <Link to="add" className="page-main__button">
          + Добавить
        </Link>
      </PageTitle>
      <Search>
        <div className="search_row">
          <label htmlFor="title">Наименование объекта</label>
          <input
            id="title"
            type="text"
            onChange={(e) =>
              setSearchQuery({ ...searchQuery, title: e.target.value })
            }
          />
        </div>
        <div className="search_row">
          <label htmlFor="meter">Счетчик</label>
          <input
            id="meter"
            type="text"
            onChange={(e) =>
              setSearchQuery({ ...searchQuery, meterNumber: e.target.value })
            }
          />
        </div>
        <div className="search_row">
          <label htmlFor="point">Точка учета</label>
          <input
            id="point"
            type="text"
            onChange={(e) =>
              setSearchQuery({
                ...searchQuery,
                countingPoint: e.target.value,
              })
            }
          />
        </div>
        <div className="search_row">
          <label htmlFor="status">Статус объекта</label>
          <select
            id="status"
            defaultValue={""}
            onChange={(e) =>
              setSearchQuery({ ...searchQuery, status: e.target.value })
            }
          >
            <option value="">Все</option>
            <option value={0}>Открыты</option>
            <option value={1}>Закрыты</option>
          </select>
        </div>
      </Search>
      <Accordion>
        {currentPageData.map((item) => (
          <div className="accordion-list_item" key={item.id}>
            <div className="accordion-list_item__button" onClick={showContent}>
              {item.title}
            </div>
            <div className="accordion__content-wrapper">
              <div style={{ padding: "10px 0" }} className="accordion__content">
                <div>
                  Шифр объекта: {item.cipher.code} {item.cipher.title}
                </div>
                <div>Точка учета: {item.counting_point || "Не указана"}</div>
                <div>Участок: {item.area.title}</div>
                {item.meter && (
                  <React.Fragment>
                    <UserDate
                      label={"Дата установки"}
                      date={item.meter.installation_date}
                    />
                    <div>Последние показания: {item.meter.last_reading}</div>
                    {item.meter.type && (
                      <React.Fragment>
                        <div>Счетчик: {item.meter.type.title}</div>
                        <div>
                          Разрядность счетчика: {item.meter.type.capacity}
                        </div>
                      </React.Fragment>
                    )}
                    <div>Номер счетчика: {item.meter.number}</div>
                  </React.Fragment>
                )}
                {item.address && (
                  <div>
                    Адрес: {addressToString(item.address)}, д.{" "}
                    {item.house_number}
                  </div>
                )}
              </div>
              <CatalogueControl>
                <ControlButton
                  label={"Субабоненты"}
                  type={"link"}
                  linkURL={"subabonents"}
                  linkState={{objects: objects.filter(obj => !obj.is_closed), objectID: item.id}}
                />
                {/* <ControlButton
                  label={"Расчетные данные"}
                  type={"button"}
                  callback={() => {}}
                /> */}
                <ControlButton
                  label="Предельные уровни"
                  type="button"
                  callback={() => {
                    setSelectedID(item.id);
                    setLimitsModalVisible(true);
                  }}
                />
                <ControlButton
                  label="Изменить"
                  type="link"
                  linkURL="edit"
                  linkState={{ id: item.id }}
                />
                <ControlButton
                  label="Удалить"
                  type="button"
                  callback={() => {
                    setSelectedID(item.id);
                    setModalVisible(true);
                  }}
                />
              </CatalogueControl>
            </div>
          </div>
        ))}
      </Accordion>
      <Pagination pageCount={pageCount} handlePageClick={handlePageClick} />
      <ModalWrapper isVisible={modalVisible} setIsVisible={setModalVisible}>
        <Confirm
          onConfirmAction={deleteObject}
          onCloseAction={setModalVisible}
        />
      </ModalWrapper>
      <ModalWrapper isVisible={limitsModalVisible} setIsVisible={closeModal}>
        <ObjectLimitsForm objectID={selectedID} onCloseAction={closeModal} />
      </ModalWrapper>
    </React.Fragment>
  );
};

export default Objects;
