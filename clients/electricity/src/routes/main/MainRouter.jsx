import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Home from "../../pages/home/Home";
import Ciphers from "../../pages/ciphers/Ciphers";
import CiphersForm from "../../components/forms/cipher/CipherForm";
import Rates from "../../pages/rates/Rates";
import RateForm from "../../components/forms/rates/RateForm";
import Meters from "../../pages/meters/Meters";
import MetersForm from "../../components/forms/meters/MetersForm";
import Areas from "../../pages/areas/Areas";
import AreasForm from "../../components/forms/areas/AreasForm";
import Workshops from "../../pages/workshops/Workshops";
import WorkshopsForm from "../../components/forms/workshops/WorkshopsForm";
import Objects from "../../pages/objects/Objects";
import ObjectForm from "../../components/forms/objects/ObjectForm";
import SubObjects from "../../pages/subobjects/SubObjects";
import Limits from "../../pages/limits/Limits";
import SubObjectsForm from "../../components/forms/subobjects/SubObjectsForm";
import LimitForm from "../../components/forms/limits/LimitForm";
import Banks from "../../pages/banks/Banks";
import BankForm from "../../components/forms/banks/BankForm";
import Renters from "../../pages/renters/Renters";
import RenterForm from "../../components/forms/renters/RenterForm";
import Payment from "../../pages/payment/Payment";
import RatesHistory from "../../pages/rates/RatesHistory";
import RatesHistoryForm from "../../components/forms/rates/RatesHistoryForm";
import Calculations from "../../pages/calculations/Calculations";
import CalculationForm from "../../components/forms/calculation/CalculationForm";
import Subabonents from "../../pages/objects/Subabonents";

const MainRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/objects" element={<Objects />} />
      <Route path="/objects/add" element={<ObjectForm />} />
      <Route path="/objects/edit" element={<ObjectForm />} />
      <Route path="/objects/subabonents" element={<Subabonents />} />
      <Route path="/objects/payment" element={<Payment />} />
      <Route path="/catalogues/ciphers" element={<Ciphers />} />
      <Route path="/catalogues/ciphers/add" element={<CiphersForm />} />
      <Route path="/catalogues/ciphers/edit" element={<CiphersForm />} />
      <Route path="/catalogues/rates" element={<Rates />} />
      <Route path="/catalogues/rates/add" element={<RateForm />} />
      <Route path="/catalogues/rates/edit" element={<RateForm />} />
      <Route path="/catalogues/rates/history" element={<RatesHistory />} />
      <Route
        path="/catalogues/rates/history/add"
        element={<RatesHistoryForm />}
      />
      <Route
        path="/catalogues/rates/history/edit"
        element={<RatesHistoryForm />}
      />
      <Route path="/catalogues/meters" element={<Meters />} />
      <Route path="/catalogues/meters/add" element={<MetersForm />} />
      <Route path="/catalogues/meters/edit" element={<MetersForm />} />
      <Route path="/catalogues/areas" element={<Areas />} />
      <Route path="/catalogues/areas/add" element={<AreasForm />} />
      <Route path="/catalogues/areas/edit" element={<AreasForm />} />
      <Route path="/catalogues/workshops" element={<Workshops />} />
      <Route path="/catalogues/workshops/add" element={<WorkshopsForm />} />
      <Route path="/catalogues/workshops/edit" element={<WorkshopsForm />} />
      <Route path="/catalogues/banks" element={<Banks />} />
      <Route path="/catalogues/banks/add" element={<BankForm />} />
      <Route path="/catalogues/banks/edit" element={<BankForm />} />
      <Route path="/catalogues/calculations" element={<Calculations />} />
      <Route
        path="/catalogues/calculations/add"
        element={<CalculationForm />}
      />
      <Route
        path="/catalogues/calculations/edit"
        element={<CalculationForm />}
      />
      <Route path="/subobjects" element={<SubObjects />} />
      <Route path="/subobjects/add" element={<SubObjectsForm />} />
      <Route path="/subobjects/edit" element={<SubObjectsForm />} />
      <Route path="/limits" element={<Limits />} />
      <Route path="/limits/add" element={<LimitForm />} />
      <Route path="/limits/edit" element={<LimitForm />} />
      <Route path="/renters" element={<Renters />} />
      <Route path="/renters/add" element={<RenterForm />} />
      <Route path="/renters/edit" element={<RenterForm />} />
    </Routes>
  );
};

export default MainRouter;
