import React from "react";
import ReactPaginate from "react-paginate";
import "./Pagination.css";

const Pagination = ({pageCount, handlePageClick}) => {
  return (
    <ReactPaginate
      previousLabel={"← Назад"}
      nextLabel={"Далее →"}
      pageCount={pageCount}
      onPageChange={handlePageClick}
      containerClassName={"pagination"}
      previousLinkClassName={"pagination__link"}
      nextLinkClassName={"pagination__link"}
      disabledClassName={"pagination__link--disabled"}
      activeClassName={"pagination__link--active"}
    />
  );
};

export default Pagination;
