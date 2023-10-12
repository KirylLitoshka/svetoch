import { Route, Routes } from "react-router-dom";
import Home from "../pages/home/Home";
import Bank from "../pages/banks/Bank";
import Rate from "../pages/rates/Rate";
import RateHistory from "../pages/rates/RateHistory";
import Test from "../pages/test/Test";
import Workshop from "../pages/workshops/Workshop";
import Currency from "../pages/currency/Currency";
import Code from "../pages/code/Code";
import Object from "../pages/objects/Object";
import Renter from "../pages/renters/Renter";
import ObjectPayments from "../pages/payments/ObjectPayments";

const MainRoutes = () => {
  return (
    <Routes>
      <Route path="test" element={<Test />} />
      <Route path="/" element={<Home />} />
      <Route path="objects" element={<Object />} />
      <Route path="objects/payments" element={<ObjectPayments />} />
      <Route path="renters" element={<Renter />} />
      <Route path="catalogues/banks" element={<Bank />} />
      <Route path="catalogues/workshops" element={<Workshop />} />
      <Route path="catalogues/currency" element={<Currency />} />
      <Route path="catalogues/codes" element={<Code />} />
      <Route path="catalogues/rates" element={<Rate />} />
      <Route path="catalogues/rates/history" element={<RateHistory />} />
    </Routes>
  );
};

export default MainRoutes;
