import React, { useEffect, useState } from "react";
import Button from "../../components/ui/buttons/base/Button";
import axios from "axios";
import ErrorMessage from "../../components/ui/messages/ErrorMessage";

const PaymentsUploadForm = ({isVisible, closeModal}) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [message, setMessage] = useState("")

  const sendFile = async (file) => {
    axios
      .post("/api/v1/warmth/payments/:files", file)
      .then((r) => {
        if (r.data.success) {
          closeModal()
        } else {
          setMessage(r.data.reason)
        }
      });
  };

  const uploadFile = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name)
    }
    const formData = new FormData();
    formData.append("file", file);
    setFile(formData);
  };

  useEffect(() => {
    if (!isVisible) {
      setFile(null)
      setFileName("")
      setMessage("")
    }
  }, [isVisible])

  if (message) {
    return <ErrorMessage message={message}/>
  }

  return (
    <React.Fragment>
      <div className="form-row" style={{ justifyContent: "center" }}>
        <label
          className="form_label"
          htmlFor="file"
          style={{ width: "60%", border: "1px solid teal", padding: "15px" }}
        >
          {fileName ? fileName : "Тыкнуть для выбора файла"}
        </label>
        <input
          className="form_input"
          type="file"
          name="file"
          id="file"
          onChange={uploadFile}
          style={{ display: "none" }}
        />
      </div>
      <div className="form-row">
        <Button text={"Отправить"} callback={() => sendFile(file)} />
      </div>
    </React.Fragment>
  );
};

export default PaymentsUploadForm;
