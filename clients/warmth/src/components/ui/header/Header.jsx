import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import "./Header.css";
import { AppContext } from "../../../context";
import { months } from "../../../utils/date";
import ConfirmModal from "../../modals/confirm/ConfirmModal";

const Header = () => {
  const { currentApplication, updateCurrentApplication } =
    useContext(AppContext);
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

                  <Link to="renters" className="header-navigation_sublist-item">
                    Арендаторы
                  </Link>
                </div>
              </li>
              <li className="header-navigation_list-item">
                <div className="header-navigation_list-button">Справочники</div>
                <div className="header-navigation_sublist">
                  <Link
                    to="catalogues/workshops"
                    className="header-navigation_sublist-item"
                  >
                    Цеха
                  </Link>
                  <Link
                    to="catalogues/rates"
                    className="header-navigation_sublist-item"
                  >
                    Тарифы
                  </Link>
                  <Link
                    to="catalogues/currency"
                    className="header-navigation_sublist-item"
                  >
                    Валютные коэффициенты
                  </Link>
                  <Link
                    to="catalogues/banks"
                    className="header-navigation_sublist-item"
                  >
                    Банки
                  </Link>
                  <Link
                    to="catalogues/codes"
                    className="header-navigation_sublist-item"
                  >
                    Коды сверки
                  </Link>
                </div>
              </li>
            </ul>
          </nav>
          {currentApplication?.id && (
            <div className="header-app">
              <div className="header-app_info">
                <div className="header-app_icon"></div>
                <div className="header-app_name">
                  {currentApplication.title}
                </div>
              </div>
              <div className="header-app_description">
                <div>
                  Расчетная дата: {months[currentApplication.month - 1]}{" "}
                  {currentApplication.year} г.
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
      <ConfirmModal
        message={"Текущий расчетный период будет сменен.\nВы уверены?"}
        isVisible={modalVisible}
        closeModal={() => setModalVisible(false)}
        onConfirm={() => {
          updateCurrentApplication();
          setModalVisible(false);
        }}
      />
    </header>
  );
};

export default Header;
