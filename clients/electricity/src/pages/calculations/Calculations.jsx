import React, { useEffect, useState } from "react";
import Loader from "../../components/ui/loader/Loader";
import axios from "axios";
import Error from "../../components/ui/error/Error";
import PageTitle from "../../components/ui/title/PageTitle";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/ui/buttons/default/Button";
import ModalWrapper from "../../components/wrappers/modal/ModalWrapper";
import Confirm from "../../components/ui/modals/confirm/Confirm";
import { months } from "../../utils/date";

const Calculations = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [calculations, setCalculations] = useState([]);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedCalculationID, setSelectedCalculationID] = useState(null);

  const deleteCalculation = async () => {
    axios
      .delete(`/api/v1/electricity/calculation/${selectedCalculationID}`)
      .then((r) => {
        if (r.data.success) {
          setCalculations(
            calculations.filter((calc) => calc.id !== selectedCalculationID)
          );
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason));
  };

  useEffect(() => {
    axios
      .get("/api/v1/electricity/calculations")
      .then((r) => {
        if (r.data.success) {
          setCalculations(r.data.items);
        } else {
          setError(r.data.reason);
        }
      })
      .catch((e) => setError(e.response.data.reason))
      .then(() => setLoading(false));
  }, []);

  if (loading) {
    return <Loader />;
  }
  if (error) {
    return <Error message={error} />;
  }

  return (
    <React.Fragment>
      <PageTitle>
        <Link to={"add"} className="page-main__button">
          + Добавить
        </Link>
      </PageTitle>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          rowGap: "5px",
        }}
      >
        {calculations.length ? (
          <table style={{ width: "60%", borderSpacing: "5px" }}>
            <tbody>
              <tr style={{ paddingBottom: "10px" }}>
                <th>Год</th>
                <th>Месяц</th>
                <th>Коэффициент 1</th>
                <th>Коэффициент 2</th>
                <th>Часы</th>
                <th rowSpan={3}>Лимиты</th>
              </tr>
            </tbody>
            <tbody>
              {calculations.map((calc) => (
                <tr key={calc.id} style={{ textAlign: "center" }}>
                  <td>{calc.year}</td>
                  <td>{months[calc.month-1]}</td>
                  <td>{calc.factor_1.toFixed(6)}</td>
                  <td>{calc.factor_2.toFixed(6)}</td>
                  <td>{calc.working_hours}</td>
                  <td>{calc.limit}</td>
                  <td>
                    <Button
                      size={20}
                      type={"edit"}
                      action={() =>
                        navigate("add", { state: { item: calc } })
                      }
                    />
                    <Button
                      size={20}
                      type={"delete"}
                      action={() => {
                        setConfirmModalVisible(true);
                        setSelectedCalculationID(calc.id);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div>Список пуст</div>
        )}
      </div>
      <ModalWrapper
        isVisible={confirmModalVisible}
        setIsVisible={setConfirmModalVisible}
      >
        <Confirm
          onConfirmAction={deleteCalculation}
          onCloseAction={setConfirmModalVisible}
        />
      </ModalWrapper>
    </React.Fragment>
  );
};

export default Calculations;
