import axios from "axios";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Loader from "../../components/ui/loader/Loader";
import Error from "../../components/ui/error/Error";
import CatalogueControl from "../../components/ui/controls/catalogue/CatalogueControl";
import ControlButton from "../../components/ui/buttons/controls/ControlButton";
import ModalWrapper from "../../components/wrappers/modal/ModalWrapper";
import Confirm from "../../components/ui/modals/confirm/Confirm";
import PageTitle from "../../components/ui/title/PageTitle";
import Accordion from "../../components/ui/accordion/Accordion";
import { showContent } from "../../utils/accordion";
import Search from "../../components/ui/search/Search";
import { useCiphers } from "../../hooks/useCiphers";

const Ciphers = () => {
  const [ciphers, setCiphers] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setLoading] = useState(true);
  const [selectedID, setSelectedID] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState({ title: "", code: "" });
  const filteredCiphers = useCiphers(ciphers, searchQuery)

  const getCiphers = async () => {
    axios
      .get("/api/v1/electricity/ciphers")
      .then((r) => {
        if (r.data.success) {
          setCiphers(r.data.items);
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .then(() => setLoading(false));
  };

  const deleteCiphers = async () => {
    axios
      .delete(`/api/v1/electricity/ciphers/${selectedID}`)
      .then((r) => {
        if (r.data.success) {
          setCiphers(ciphers.filter((cipher) => cipher.id !== selectedID));
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .then(() => setModalVisible(false));
  };

  useEffect(() => {
    getCiphers();
  }, []);

  if (isLoading) {
    return <Loader />;
  } else if (error) {
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
          <label htmlFor="title">Наименование</label>
          <input
            type="text"
            id="title"
            value={searchQuery.title}
            onChange={(e) =>
              setSearchQuery({ ...searchQuery, title: e.target.value })
            }
          />
        </div>
        <div className="search_row">
          <label htmlFor="code">Код шифра</label>
          <input
            type="text"
            id="code"
            value={searchQuery.code}
            onChange={(e) =>
              setSearchQuery({ ...searchQuery, code: e.target.value })
            }
          />
        </div>
      </Search>
      <Accordion>
        {filteredCiphers.map((cipher) => (
          <div className="accordion-list_item" key={cipher.id}>
            <div className="accordion-list_item__button" onClick={showContent}>
              {cipher.title}
            </div>
            <div className="accordion__content-wrapper">
              <div style={{ padding: "10px 0" }} className="accordion__content">
                <div>Код шифра: {cipher.code}</div>
              </div>
              <CatalogueControl>
                <ControlButton
                  type="link"
                  label="Изменить"
                  linkURL="edit"
                  linkState={{ item: cipher }}
                />
                <ControlButton
                  label={"Удалить"}
                  type="button"
                  callback={() => {
                    setSelectedID(cipher.id);
                    setModalVisible(true);
                  }}
                />
              </CatalogueControl>
            </div>
          </div>
        ))}
      </Accordion>
      <ModalWrapper isVisible={modalVisible} setIsVisible={setModalVisible}>
        <Confirm
          onConfirmAction={deleteCiphers}
          onCloseAction={setModalVisible}
        />
      </ModalWrapper>
    </React.Fragment>
  );
};

export default Ciphers;
