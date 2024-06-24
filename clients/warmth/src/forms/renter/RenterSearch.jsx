import React from "react";
import Search from "../../components/wrappers/search/Search";

const RenterSearch = ({style, searchQuery, setSearchQuery }) => {
  return (
    <Search style={style}>
      {searchQuery.hasOwnProperty("title") &&
      (
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
      )}
      {searchQuery.hasOwnProperty("registration_number") &&
      (
        <div className="search_row">
          <label htmlFor="search_code">УНП</label>
          <input
            id="search_code"
            type="text"
            value={searchQuery.code}
            onChange={(e) =>
              setSearchQuery({
                ...searchQuery,
                registration_number: e.target.value,
              })
            }
          />
        </div>
      )}
      {searchQuery.hasOwnProperty("is_closed") &&
      (
        <div className="search_row">
          <label htmlFor="search_closed">Статус арендатора</label>
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
      )}
    </Search>
  );
};

export default RenterSearch;
