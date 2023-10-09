import React from "react";
import Search from "../../components/wrappers/search/Search";

const ObjectSearch = ({ searchQuery, setSearchQuery }) => {
  return (
    <Search>
      <div className="search_row">
        <label htmlFor="search_title">Наименование объекта</label>
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
        <label htmlFor="search_code">Лицевой счет</label>
        <input
          id="search_code"
          type="text"
          value={searchQuery.code}
          onChange={(e) =>
            setSearchQuery({ ...searchQuery, code: e.target.value })
          }
        />
      </div>
    </Search>
  );
};

export default ObjectSearch;
