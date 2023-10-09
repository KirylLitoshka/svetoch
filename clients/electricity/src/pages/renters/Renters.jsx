import axios from "axios";
import React, { useEffect, useState } from "react";
import Loader from "../../components/ui/loader/Loader";
import Error from "../../components/ui/error/Error";
import PageTitle from "../../components/ui/title/PageTitle";
import { Link } from "react-router-dom";
import Search from "../../components/ui/search/Search";
import Accordion from "../../components/ui/accordion/Accordion";
import { showContent } from "../../utils/accordion";
import UserDate from "../../components/ui/date/Date";
import CatalogueControl from "../../components/ui/controls/catalogue/CatalogueControl";
import ControlButton from "../../components/ui/buttons/controls/ControlButton";
import ModalWrapper from "../../components/wrappers/modal/ModalWrapper";
import Confirm from "../../components/ui/modals/confirm/Confirm";
import { useRenters } from "../../hooks/useRenters";
import ObjectsList from "../objects/ObjectsList";

const Renters = () => {
  const [renters, setRenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedRenterID, setSelectedRenterID] = useState(null)
  const [objectsModalVisible, setObjectsModalVisible] = useState(false)
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState({
    name: "",
    registration_number: "",
    status: false,
  });
  const searchedRenters = useRenters(renters, searchQuery)

  useEffect(() => {
    getRenters();
  }, []);

  const getRenters = async () => {
    axios
      .get("/api/v1/electricity/renters")
      .then((r) => {
        if (r.data.success) {
          setRenters(r.data.items);
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .then(() => setLoading(false));
  };

  const deleteRenter = async () => {
    axios
      .delete(`/api/v1/electricity/renters/${selectedItem.id}`)
      .then((r) => {
        if (r.data.success) {
          setRenters(renters.filter((renter) => renter.id !== selectedItem.id));
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason));
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
        <Link to="add" className="page-main__button">
          + Добавить
        </Link>
      </PageTitle>
      <Search>
        <div className="search_row">
          <label htmlFor="name">Наименование</label>
          <input
            type="text"
            id="name"
            value={searchQuery.name}
            onChange={(e) =>
              setSearchQuery({ ...searchQuery, name: e.target.value })
            }
          />
        </div>
        <div className="search_row">
          <label htmlFor="regnum">УНП</label>
          <input
            type="text"
            id="regnum"
            value={searchQuery.registration_number}
            onChange={(e) =>
              setSearchQuery({
                ...searchQuery,
                registration_number: e.target.value,
              })
            }
          />
        </div>
        <div className="search_row">
          <label htmlFor="status">Статус арендатора</label>{" "}
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
        {searchedRenters.map((renter) => (
          <div className="accordion-list_item" key={renter.id}>
            <div className="accordion-list_item__button" onClick={showContent}>
              {renter.name}
            </div>
            <div className="accordion__content-wrapper">
              <div className="accordion__content" style={{ padding: "10px 0" }}>
                <div>Наименование: {renter.full_name}</div>
                <div>
                  Расчетный счет: {renter.checking_account || "Не указан"}
                </div>
                <div>УНП: {renter.registration_number || "Не указан"}</div>
                <div>ОКПО: {renter.respondent_number || "Не указан"}</div>
                <div>
                  Номер договора: {renter.contract_number || "Не указан"}
                </div>
                <UserDate
                  label={"Дата заключения договора"}
                  date={renter.contract_date}
                />
                <div>Адрес: {renter.address || "Не указан"}</div>
                <div>Контакты: {renter.contacts || "Не указаны"}</div>
                <div>Бюджет: {renter.is_public_sector ? "Да" : "Нет"}</div>
              </div>
              <CatalogueControl>
                <ControlButton
                  type={"button"}
                  label={"Точки арендатора"}
                  callback={() => {
                    setSelectedRenterID(renter.id)
                    setObjectsModalVisible(true)
                  }}
                />
                <ControlButton
                  type={"button"}
                  callback={() => {
                    setSelectedItem(renter);
                    setModalVisible(true);
                  }}
                  label={"Удалить"}
                />
                <ControlButton
                  type={"link"}
                  linkURL={"edit"}
                  linkState={{ item: renter }}
                  label={"Изменить"}
                />
              </CatalogueControl>
            </div>
          </div>
        ))}
      </Accordion>
      <ModalWrapper isVisible={modalVisible} setIsVisible={setModalVisible}>
        <Confirm
          onCloseAction={setModalVisible}
          onConfirmAction={deleteRenter}
        />
      </ModalWrapper>
      <ModalWrapper isVisible={objectsModalVisible} setIsVisible={setObjectsModalVisible}>
        <ObjectsList closeAction={setObjectsModalVisible} field={"renter"} id={selectedRenterID} />
      </ModalWrapper>
    </React.Fragment>
  );
};

export default Renters;
