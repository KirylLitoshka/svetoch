import "./App.css";
import React, { useEffect, useState } from "react";
import PageWrapper from "../components/wrappers/page/PageWrapper";
import Header from "../components/ui/header/Header";
import MainRouter from "../routes/main/MainRouter";
import MainWrapper from "../components/wrappers/main/MainWrapper";
import { BrowserRouter as Router } from "react-router-dom";
import { AppContext } from "../context";
import axios from "axios";
import Loader from "../components/ui/loader/Loader";
import Error from "../components/ui/error/Error";

const App = () => {
  const [app, setApp] = useState({});
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const updateAppPeriod = async () => {
    axios
      .patch("/api/v1/electricity/", app)
      .then((r) => {
        if (r.data.success) {
          setApp(r.data.item);
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason));
  };

  useEffect(() => {
    axios
      .get("/api/v1/electricity/")
      .then((r) => {
        if (r.data.success) {
          setApp(r.data.item);
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .then(() => setLoading(false));
  }, []);

  return (
    <PageWrapper>
      <AppContext.Provider value={{ app, updateAppPeriod }}>
        <Router>
          <Header />
          <MainWrapper>
            {loading ? (
              <Loader />
            ) : error ? (
              <Error message={error} />
            ) : (
              <MainRouter />
            )}
          </MainWrapper>
        </Router>
      </AppContext.Provider>
    </PageWrapper>
  );
};

export default App;
