import React, { useState } from "react";
import ModalWrapper from "../../components/wrappers/modal/ModalWrapper";
import Button from "../../components/ui/buttons/base/Button";
import RenterSearch from "../../forms/renter/RenterSearch";
import { useRenters } from "../../hooks/useRenters";

const RentersSelection = ({
  rentersList,
  isVisible,
  onClose,
  selectedItems,
  setSelectedItems,
  confirmCallback,
  reportType,
}) => {
  const [searchQuery, setSearchQuery] = useState({
    title: "",
    registration_number: "",
  });
  const filteredRentersList = useRenters(rentersList, searchQuery);

  const changeCheckboxStatus = (id, fieldName) => {
    const currentRenter = selectedItems.find((item) => item.id === id);
    currentRenter[fieldName] = !currentRenter[fieldName];
    setSelectedItems(
      selectedItems.map((item) =>
        item.id === currentRenter.id ? currentRenter : item
      )
    );
  };

  return (
    <ModalWrapper isVisible={isVisible} closeModal={onClose}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "row-reverse",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            columnGap: "10px",
          }}
        >
          <Button
            text={"Выделить все"}
            callback={() =>
              setSelectedItems(
                Array.from(
                  rentersList.map((renter) => {
                    return { id: renter.id, invoice: true, attachment: true };
                  })
                )
              )
            }
          />
          <Button
            text={"Снять выделен"}
            callback={() => setSelectedItems([])}
          />
          <Button text={"Сформировать"} callback={confirmCallback} />
        </div>
        <RenterSearch
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </div>
      <div
        style={{
          minWidth: "80vw",
          minHeight: "80vh",
          maxHeight: "80vh",
          overflow: "overlay",
        }}
      >
        {filteredRentersList.map((renter, index) => (
          <div
            key={renter.id}
            style={{
              fontSize: "18px",
              margin: "5px 0",
              display: "flex",
              justifyContent: "space-between",
              alignContent: "center",
            }}
          >
            <div>
              <input
                size={40}
                type="checkbox"
                name=""
                id={`renter_${renter.id}`}
                checked={selectedItems.some((item) => item.id === renter.id)}
                onChange={() => {
                  if (selectedItems.some((item) => item.id === renter.id)) {
                    setSelectedItems(
                      selectedItems.filter((item) => item.id !== renter.id)
                    );
                  } else {
                    setSelectedItems([
                      ...selectedItems,
                      { id: renter.id, invoice: true, attachment: true },
                    ]);
                  }
                }}
              />
              <label
                style={{ padding: "0 5px" }}
                htmlFor={`renter_${renter.id}`}
              >
                {index + 1}. {renter.name} ({renter.id})
              </label>
            </div>
            {reportType === "renter_invoice_print" &&
              selectedItems.some((item) => item.id === renter.id) && (
                <div>
                  <label htmlFor={`invoice_${renter.id}`}>
                    Счет
                    <input
                      style={{ margin: "0 8px" }}
                      type="checkbox"
                      name={`invoice_${renter.id}`}
                      id={`invoice_${renter.id}`}
                      checked={
                        selectedItems.find((item) => item.id === renter.id)
                          .invoice
                      }
                      onChange={() =>
                        changeCheckboxStatus(renter.id, "invoice")
                      }
                    />
                  </label>
                  <label htmlFor={`attachment_${renter.id}`}>
                    Приложение
                    <input
                      style={{ margin: "0 8px" }}
                      type="checkbox"
                      name={`attachment_${renter.id}`}
                      id={`attachment_${renter.id}`}
                      checked={
                        selectedItems.find((item) => item.id === renter.id)
                          .attachment
                      }
                      onChange={() =>
                        changeCheckboxStatus(renter.id, "attachment")
                      }
                    />
                  </label>
                </div>
              )}
          </div>
        ))}
      </div>
    </ModalWrapper>
  );
};

export default RentersSelection;
