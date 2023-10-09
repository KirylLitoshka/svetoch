import React, { useState } from "react";
import Button from "../../components/ui/buttons/base/Button";

const TestForm = ({ onSubmit }) => {
  const [file, setFile] = useState(null);

  const uploadFile = (event) => {
    const file = event.target.files[0];
    console.log(file);
    const formData = new FormData();
    formData.append("file", file);
    setFile(formData);
  };

  return (
    <React.Fragment>
      <div className="form-row">
        <label className="form_label" htmlFor="file">Фаил</label>
        <input className="form_input" type="file" name="file" id="file" onChange={uploadFile}/>
      </div>
      <div className="form-row">
        <Button text={"Отправить"} callback={() => onSubmit(file)} />
      </div>
    </React.Fragment>
  );
};

export default TestForm;
