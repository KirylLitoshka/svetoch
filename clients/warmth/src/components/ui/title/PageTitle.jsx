import React from "react";
import "./PageTitle.css"


const PageTitle = ({title, children}) => {
  return (
    <div className={`page-main__title ${title ? "page-main__title_content_between" : "page-main__title_content_end"}`}>
      {title && 
        <h2>{title}</h2>
      }
      {children}
    </div>
  )
}

export default PageTitle;