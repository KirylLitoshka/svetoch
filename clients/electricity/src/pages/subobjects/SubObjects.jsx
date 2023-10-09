import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import Loader from "../../components/ui/loader/Loader";
import Error from "../../components/ui/error/Error";
import Accordion from "../../components/ui/accordion/Accordion";
import PageTitle from "../../components/ui/title/PageTitle";
import { Link } from "react-router-dom";
import CatalogueControl from "../../components/ui/controls/catalogue/CatalogueControl";
import ControlButton from "../../components/ui/buttons/controls/ControlButton";
import ModalWrapper from "../../components/wrappers/modal/ModalWrapper";
import Confirm from "../../components/ui/modals/confirm/Confirm";
import { showContent } from "../../utils/accordion";
import Search from "../../components/ui/search/Search";
import ObjectsList from "../objects/ObjectsList";

const SubObjects = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState({ title: "" });
  const [subObjects, setSubObjects] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [objectsModalVisible, setObjectsModalVisible] = useState(false)
  const [selectedItem, setSelectedItem] = useState({});
  const [selectedSubObjectID, setSelectedSubObjectID] = useState(null)

  const useFilteredSubObjects = (subObjects, searchQuery) => {
    return useMemo(() => {
      if (searchQuery.title) {
        return subObjects.filter((item) =>
          item.title.toLowerCase().includes(searchQuery.title.toLowerCase())
        );
      }
      return subObjects;
    }, [subObjects, searchQuery]);
  };

  const filteredSubObjects = useFilteredSubObjects(subObjects, searchQuery);

  const deleteSubObject = async () => {
    await axios
      .delete(`/api/v1/electricity/subobjects/${selectedItem.id}`)
      .then((r) => {
        if (r.data.success) {
          setSubObjects(
            subObjects.filter((item) => item.id !== selectedItem.id)
          );
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .then(() => setModalVisible(false));
  };

  useEffect(() => {
    const getSubObjects = async () => {
      axios
        .get("/api/v1/electricity/subobjects")
        .then((r) => {
          if (r.data.success) {
            setSubObjects(r.data.items);
          } else {
            setError(r.data.reason);
          }
        })
        .catch((e) => setError(e.response.data.reason))
        .then(() => setLoading(false));
    };

    getSubObjects();
  }, []);

  const objectsListVisible = (status=false) => {
    setSelectedSubObjectID(null)
    setObjectsModalVisible(status)
  }

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
          <label htmlFor="title">Наименование</label>
          <input
            type="text"
            id="title"
            value={searchQuery.title}
            onChange={(e) => setSearchQuery({ title: e.target.value })}
          />
        </div>
      </Search>
      <Accordion>
        {filteredSubObjects.map((subObject) => (
          <div className="accordion-list_item" key={subObject.id}>
            <div className="accordion-list_item__button" onClick={showContent}>
              {subObject.title}
            </div>
            <div className="accordion__content-wrapper">
              <div style={{ padding: "10px 0" }} className="accordion__content">
                <div>Киловатты: тут будет сумма киловатт</div>
                <div>Количество точек: {subObject.objects_amount}</div>
              </div>
              <CatalogueControl>
                <ControlButton
                  label={"Точки"}
                  type={"button"}
                  callback={() => {
                    setSelectedSubObjectID(subObject.id)
                    setObjectsModalVisible(true)
                  }}
                />
                <ControlButton
                  label={"Изменить"}
                  type={"link"}
                  linkURL={"edit"}
                  linkState={{ item: subObject }}
                />
                <ControlButton
                  type={"button"}
                  label={"Удалить"}
                  callback={() => {
                    setModalVisible(true);
                    setSelectedItem(subObject);
                  }}
                />
              </CatalogueControl>
            </div>
          </div>
        ))}
      </Accordion>
      <ModalWrapper isVisible={modalVisible} setIsVisible={setModalVisible}>
        <Confirm
          onCloseAction={setModalVisible}
          onConfirmAction={deleteSubObject}
        />
      </ModalWrapper>
      <ModalWrapper isVisible={objectsModalVisible} setIsVisible={objectsListVisible} >
        <ObjectsList field={"subobjects"} id={selectedSubObjectID} closeAction={objectsListVisible}/>
      </ModalWrapper>
    </React.Fragment>
  );
};

export default SubObjects;
