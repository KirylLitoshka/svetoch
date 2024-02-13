import React from 'react';
import "./Home.css"
import {Link} from "react-router-dom";

const main = () => {
    return (
        <div className="main">
            <div className="main-menu">
                <div className="main-menu_item">
                    <Link to="/objects" className="main-menu_item-link">Объекты</Link>
                </div>
                <div className="main-menu_item">
                    <Link to="/renters" className="main-menu_item-link">Арендаторы</Link>
                </div>
                <div className="main-menu_item">
                    <Link to="/reports" className="main-menu_item-link">Отчеты</Link>
                </div>
            </div>
        </div>
    );
};

export default main;