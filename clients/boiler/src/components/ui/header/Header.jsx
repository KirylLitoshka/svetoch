import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";

const Header = () => {
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
                  <Link to="/" className="header-navigation_sublist-item">
                    Пункт подменю
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
                    Банки
                  </Link>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
