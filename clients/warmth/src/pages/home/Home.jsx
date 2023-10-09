import React from 'react';
import "./Home.css"
import {Link} from "react-router-dom";

const Home = () => {
    return (
        <div className="home">
            <div className="home-menu">
                <div className="home-menu_item">
                    <Link to="/objects" className="home-menu_item-link">Объекты</Link>
                </div>
                <div className="home-menu_item">
                    <Link to="/renters" className="home-menu_item-link">Арендаторы</Link>
                </div>
            </div>
        </div>
    );
};

export default Home;