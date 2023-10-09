import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import "./Header.css";
import { AppContext } from "../../../context";
import { months } from "../../../utils/date";
import ModalWrapper from "../../wrappers/modal/ModalWrapper";
import Notification from "../modals/notify/Notification";

const Header = () => {
  const { app, updateAppPeriod } = useContext(AppContext);
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <header className="page-header">
      <div className="content_container">
        <div className="page-header_content">
          <nav className="header-navigation">
            <ul className="header-navigation_list">
              <li className="header-navigation_list-item">
                <div className="header-navigation_list-button">
                  <Link to="/" className="header-navigation_list-item">
                    Главная
                  </Link>
                </div>
                <div className="header-navigation_sublist">
                  <Link to="objects" className="header-navigation_sublist-item">
                    Объекты
                  </Link>
                  <Link
                    to="subobjects"
                    className="header-navigation_sublist-item"
                  >
                    Подобъекты
                  </Link>
                  <Link to="renters" className="header-navigation_sublist-item">
                    Арендаторы
                  </Link>
                  <Link to="limits" className="header-navigation_sublist-item">
                    Предельные уровни
                  </Link>
                </div>
              </li>
              <li className="header-navigation_list-item">
                <div className="header-navigation_list-button">Справочники</div>
                <div className="header-navigation_sublist">
                  <Link
                    to="catalogues/rates"
                    className="header-navigation_sublist-item"
                  >
                    Тарифы
                  </Link>
                  <Link
                    to="catalogues/ciphers"
                    className="header-navigation_sublist-item"
                  >
                    Шифры
                  </Link>
                  <Link
                    to="/catalogues/meters"
                    className="header-navigation_sublist-item"
                  >
                    Марки счетчиков
                  </Link>
                  <Link
                    to="/catalogues/areas"
                    className="header-navigation_sublist-item"
                  >
                    Участки
                  </Link>
                  <Link
                    to="/catalogues/workshops"
                    className="header-navigation_sublist-item"
                  >
                    Цеха
                  </Link>
                  <Link
                    to="/catalogues/banks"
                    className="header-navigation_sublist-item"
                  >
                    Банки
                  </Link>
                  <Link
                    to="/catalogues/calculations"
                    className="header-navigation_sublist-item"
                  >
                    Расчетные данные
                  </Link>
                </div>
              </li>
            </ul>
          </nav>
          {app.id && (
            <div className="header-app">
              <div className="header-app_info">
                <div className="header-app_icon"></div>
                <div className="header-app_name">{app.title}</div>
              </div>
              <div className="header-app_description">
                <div>
                  Расчетная дата: {months[app.month - 1]} {app.year} г.
                </div>
                <button
                  className="header-app_button"
                  onClick={() => setModalVisible(true)}
                >
                  Новый месяц
                </button>
                <button className="header-app_button">
                  Кнопка настройки 1
                </button>
                <button className="header-app_button">
                  Кнопка настройки 2
                </button>
                <button className="header-app_button">
                  Кнопка настройки 3
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <ModalWrapper
        isVisible={modalVisible}
        setIsVisible={() => setModalVisible(false)}
      >
        <Notification
          text={"Текущий расчетный период будет сменен.\nВы уверены?"}
          onCloseAction={() => setModalVisible(false)}
          onSubmitAction={() => {
            updateAppPeriod();
            setModalVisible(false);
          }}
        />
      </ModalWrapper>
    </header>
  );
};

export default Header;
