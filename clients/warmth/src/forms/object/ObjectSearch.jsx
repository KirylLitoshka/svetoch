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
      <div className="search_row">
        <label htmlFor="search_closed">Статус объекта</label>
        <select
          name="search_closed"
          id="search_closed"
          value={searchQuery.is_closed ? "1" : "0"}
          onChange={(e) =>
            setSearchQuery({
              ...searchQuery,
              is_closed: Boolean(+e.target.value),
            })
          }
        >
          <option value="0">Открыт</option>
          <option value="1">Закрыт</option>
        </select>
      </div>
    </Search>
  );
};

export default ObjectSearch;
