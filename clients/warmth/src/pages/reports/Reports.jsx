import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Loader from "../../components/ui/loader/Loader";
import ErrorMessage from "../../components/ui/messages/ErrorMessage";
import Form from "../../components/ui/form/Form";
import RenterReport from "../../forms/renter/RenterReport";
import WorkshopChoiceForm from "../../forms/workshop/WorkshopChoiceForm";
import ModalWrapper from "../../components/wrappers/modal/ModalWrapper";

const Reports = () => {
  const [modalVisible, setModalVisible] = useState({
    renter: false,
    workshop: false,
    error: false,
  });
  const [workshops, setWorkshops] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const getNormReport = async (e) => {
    e.preventDefault();
    axios.get("/api/v1/warmth/reports/files/consolidated").then((r) => {
      if (r.status === 200) {
        const url = URL.createObjectURL(new Blob([r.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "report.txt");
        link.click();
      } else {
        setError(r.data.reason);
        setModalVisible({ ...modalVisible, error: true });
      }
    });
  };

  const getRentersReport = async (reportType) => {
    if (!reportType) {
      return
    }
    setModalVisible({ ...modalVisible, renter: false });
    axios.get(`/api/v1/warmth/reports/files/${reportType}`).then((r) => {
      if (r.data.success) {
        const url = URL.createObjectURL(new Blob([r.data.item]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "renters_report.txt");
        link.click();
      } else {
        setError(r.data.reason);
        setModalVisible({ ...modalVisible, error: true });
      }
    });
  };

  const getReportByWorkshop = async (id) => {
    if (!id) {
      return
    }
    setModalVisible({ ...modalVisible, workshop: false });
    axios
      .get("/api/v1/warmth/reports/files/workshop", { params: { id: id } })
      .then((r) => {
        if (r.data.success) {
          const url = URL.createObjectURL(new Blob([r.data.item]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "workshop_report.txt");
          link.click();
        } else {
          setError(r.data.reason);
          setModalVisible({ ...modalVisible, error: true });
        }
      })
      .catch((e) => {
        setError(e.response.data.reason);
        setModalVisible({ ...modalVisible, error: true });
      });
  };

  const getWorkshopItems = async () => {
    axios
      .get("/api/v1/warmth/workshops")
      .then((r) => {
        if (r.data.success) {
          setWorkshops(r.data.items);
        } else {
          setModalVisible({ ...modalVisible, error: true });
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getWorkshopItems();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <React.Fragment>
      <div className="main">
        <div className="main-menu">
          <div className="main-menu_item">
            <Link
              className="main-menu_item-link"
              onClick={(e) => getNormReport(e)}
            >
              Сводная ведомость
            </Link>
          </div>
          <div className="main-menu_item">
            <Link
              className="main-menu_item-link"
              onClick={() => setModalVisible({ ...modalVisible, renter: true })}
            >
              Арендаторы
            </Link>
          </div>
          <div className="main-menu_item">
            <Link
              className="main-menu_item-link"
              onClick={() =>
                setModalVisible({ ...modalVisible, workshop: true })
              }
            >
              Отчет по цехам
            </Link>
          </div>
        </div>
      </div>
      <Form
        isModal={true}
        modalVisible={modalVisible.renter}
        closeModal={() => setModalVisible({ ...modalVisible, renter: false })}
        component={<RenterReport callback={getRentersReport} />}
      />
      <Form
        isModal={true}
        modalVisible={modalVisible.workshop}
        closeModal={() => setModalVisible({ ...modalVisible, workshop: false })}
        component={
          <WorkshopChoiceForm
            workshops={workshops}
            confirmCallback={(id) => getReportByWorkshop(id)}
          />
        }
      />
      <ModalWrapper
        isVisible={modalVisible.error}
        closeModal={() => {
          setModalVisible({ ...modalVisible, error: false });
          setError("");
        }}
      >
        <ErrorMessage message={error} />
      </ModalWrapper>
    </React.Fragment>
  );
};

export default Reports;
