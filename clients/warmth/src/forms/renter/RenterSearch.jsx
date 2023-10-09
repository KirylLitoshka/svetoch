import React from "react";
import Search from "../../components/wrappers/search/Search";

const RenterSearch = ({ searchQuery, setSearchQuery }) => {
  return (
    <Search>
      <div className="search_row">
        <label htmlFor="search_title">Наименование</label>
        <input
          id="search_title"
          type="text"
          value={searchQuery.title}
          onChange={(e) =>
            setSearchQuery({ ...searchQuery, title: e.target.value })
          }
        />
      </div>
      <div className="search_row">
        <label htmlFor="search_code">УНП</label>
        <input
          id="search_code"
          type="text"
          value={searchQuery.code}
          onChange={(e) =>
            setSearchQuery({ ...searchQuery, registration_number: e.target.value })
          }
        />
      </div>
    </Search>
  );
};

export default RenterSearch;
