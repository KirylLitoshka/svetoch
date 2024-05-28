import "./App.css";
import React from "react";
import PageWrapper from "../components/wrappers/page/PageWrapper";
import Header from "../components/ui/header/Header";
import MainRouter from "../routes/main/MainRouter";
import MainWrapper from "../components/wrappers/main/MainWrapper";
import { BrowserRouter as Router } from "react-router-dom";


const App = () => {
  return (
    <PageWrapper>
        <Router>
          <Header />
          <MainWrapper>
            <MainRouter />
          </MainWrapper>
        </Router>
    </PageWrapper>
  );
};

export default App;
