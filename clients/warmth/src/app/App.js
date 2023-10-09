import axios from "axios";
import { useEffect, useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AppContext } from "../context/index";
import Header from "../components/ui/header/Header";
import PageWrapper from "../components/wrappers/page/PageWrapper";
import MainRoutes from "../routes/MainRoutes";
import MainWrapper from "../components/wrappers/main/MainWrapper"
import Loader from "../components/ui/loader/Loader";
import ErrorMessage from "../components/ui/messages/ErrorMessage";

function App() {
  const [currentApplication, setCurrentApplication] = useState(null);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getCurrentApplication = async () => {
    axios
      .get("/api/v1/warmth/")
      .then((r) => {
        if (r.data.success) {
          setCurrentApplication(r.data.item);
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .then(() => setIsLoading(false));
  };

  const updateCurrentApplication = async () => {
    axios
      .patch("/api/v1/warmth/", currentApplication)
      .then((r) => {
        if (r.data.success) {
          setCurrentApplication(r.data.item);
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason));
  };

  useEffect(() => {
    getCurrentApplication();
  }, []);

  return (
    <PageWrapper>
      <AppContext.Provider
        value={{ currentApplication, updateCurrentApplication }}
      >
        <Router>
          <Header />
          <MainWrapper>
            {isLoading ? (
              <Loader />
            ) : error ? (
              <ErrorMessage message={error} />
            ) : (
              <MainRoutes />
            )}
          </MainWrapper>
        </Router>
      </AppContext.Provider>
    </PageWrapper>
  );
}

export default App;
