export const showContent = (e) => {
  e.target.classList.toggle("accordion-list_item__button_active");

  let content = e.target.nextElementSibling;
  if (content.style.maxHeight) {
    content.style.maxHeight = null;
  } else {
    content.style.maxHeight = content.scrollHeight + "px";
  }
};
