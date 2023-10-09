import React from "react";
import Form from "../../components/ui/form/Form";
import TestForm from "../../forms/test/TestForm";
import axios from "axios";

const Test = () => {
  const sendData = async (data) => {
    axios.post('/api/v1/warmth/test', data).then((r) => console.log(r))
  }

  return <Form isModal={false} component={<TestForm onSubmit={sendData} />} />
}

export default Test