import React, { useState } from "react";
import ModalWrapper from "../../components/wrappers/modal/ModalWrapper";
import Button from "../../components/ui/buttons/base/Button";
import RenterSearch from "../../forms/renter/RenterSearch";
import { useRenters } from "../../hooks/useRenters";

const RentersSelection = ({
  rentersList,
  isVisible,
  onClose,
  selectedIDs,
  setSelectedIDs,
  confirmCallback,
}) => {
  const [searchQuery, setSearchQuery] = useState({
    title: "",
    registration_number: ""
  });
  const filteredRentersList = useRenters(rentersList, searchQuery);

  return (
    <ModalWrapper isVisible={isVisible} closeModal={onClose}>
      <div
        style={{ display: "flex", justifyContent: "center", columnGap: "10px" }}
      >
        <Button
          text={"Выделить все"}
          callback={() =>
            setSelectedIDs(Array.from(rentersList.map((renter) => renter.id)))
          }
        />
        <Button text={"Снять выделен"} callback={() => setSelectedIDs([])} />
        <Button text={"Сформировать"} callback={confirmCallback} />
      </div>
      <RenterSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <div style={{ minWidth: "80vw", minHeight: "80vh", maxHeight: "80vh", overflow: "overlay" }}>
        {filteredRentersList.map((renter, index) => (
          <div key={renter.id} style={{ fontSize: "18px", margin: "5px 0" }}>
            <input
              size={40}
              type="checkbox"
              name=""
              id={`renter_${renter.id}`}
              checked={selectedIDs.includes(renter.id)}
              onChange={() => {
                if (selectedIDs.includes(renter.id)) {
                  setSelectedIDs(selectedIDs.filter((id) => id !== renter.id));
                } else {
                  setSelectedIDs([...selectedIDs, renter.id]);
                }
              }}
            />
            <label style={{ padding: "0 5px" }} htmlFor={`renter_${renter.id}`}>
              {index}. {renter.name} ({renter.id})
            </label>
          </div>
        ))}
      </div>
    </ModalWrapper>
  );
};

export default RentersSelection;
