// DOM Select
const menu_nav = document.querySelector(".menu");
const submit_form = document.querySelector(".submit-form");
const input_input = document.querySelector(".input");
const notesContainer_div = document.querySelector(".notes-container");
const popup = document.querySelector(".popup");

// Class
class Notes {
  constructor() {
    this.load();
  }

  load() {
    this.active = JSON.parse(localStorage.getItem("active-notes")) || [];
    this.done = JSON.parse(localStorage.getItem("done-notes")) || [];
    this.deleted = JSON.parse(localStorage.getItem("deleted-notes")) || [];
  }

  save() {
    localStorage.setItem("active-notes", JSON.stringify(this.active));
    localStorage.setItem("done-notes", JSON.stringify(this.done));
    localStorage.setItem("deleted-notes", JSON.stringify(this.deleted));
  }

  add(text) {
    const id = this.IDGenerator();
    this.active.push({ id, text });
  }

  delete(id) {
    this.deleted = this.deleted.filter((el) => {
      return el.id !== id;
    });
    this.active = this.active.filter((el) => {
      el.id === id && this.deleted.push(el);
      return el.id !== id;
    });
    this.done = this.done.filter((el) => {
      el.id === id && this.deleted.push(el);
      return el.id !== id;
    });
  }

  edit(id, text) {
    for (const [groupName, notes] of Object.entries(this)) {
      notes.map((note) => {
        return note.id === id ? (note.text = text) : (note.text = note.text);
      });
    }
  }

  moveToDone(id) {
    this.active = this.active.filter((el) => {
      el.id === id && this.done.push(el);
      return el.id !== id;
    });
  }

  IDGenerator() {
    return performance.now().toString(36);
  }
}

// Global constants and variables
const notes = new Notes();
// let displayState = "show-active";
let editFlag = false;
let editID = null;
let popupTimer;

//********* Functions *********
const render = (displayState = "show-active") => {
  let toRender = [];
  // check which category should be rendered
  displayState === "show-active"
    ? (toRender = notes.active)
    : displayState === "show-done"
    ? (toRender = notes.done)
    : displayState === "show-deleted"
    ? (toRender = notes.deleted)
    : "";
  // note display part
  notesContainer_div.innerHTML = "";
  toRender.forEach((el) => {
    const newElement = document.createElement("form");
    newElement.id = el.id;
    newElement.classList.add("note");
    newElement.innerHTML = `<input type="checkbox" name="checkbox" class='checkbox'>
                    <label class="note__text">${el.text}</label>
                    <div class="note__options">
                        <button type="submit" data-action="edit-note" class="btn note__btn">
                            <svg viewBox="0 0 47 47" width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path d="M8.071 21.586l-7.071 1.414 1.414-7.071 14.929-14.929 5.657 5.657-14.929 14.929zm-.493-.921l-4.243-4.243-1.06 5.303 5.303-1.06zm9.765-18.251l-13.3 13.301 4.242 4.242 13.301-13.3-4.243-4.243z"/></svg>
                        </button>
                        <button type="submit" data-action="delete-note" class="btn note__btn">
                            <svg viewBox="0 0 47 47" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                <path
                                d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z" />
                            </svg>
                        </button>
                    </div>`;
    notesContainer_div.appendChild(newElement);
    // event listeners for every single note
    [...notesContainer_div.children].forEach((note) => {
      [...note].forEach((el) => {
        el.name === "checkbox"
          ? el.addEventListener("change", notesCheckboxHandler)
          : el.addEventListener("click", noteOptionHandler);
      });
    });
  });
};

const notesCheckboxHandler = (e) => {
  e.preventDefault();
  popupHandler("isDone");
  notes.moveToDone(e.currentTarget.parentNode.id);
  notes.save();
  render();
};

const noteOptionHandler = (e) => {
  event.preventDefault();
  const noteContainer = e.currentTarget.parentNode.parentNode;

  if (editFlag) return;

  if (e.currentTarget.dataset.action === "delete-note") {
    notes.delete(noteContainer.id);
    popupHandler("isDeleted");
    notes.save();
    render();
  } else if (e.currentTarget.dataset.action === "edit-note") {
    editFlag = true;
    editID = noteContainer.id;
    noteContainer.classList.add("edit");
    noteContainer.innerHTML = noteContainer.innerHTML;
    input_input.value =
      noteContainer.firstElementChild.nextElementSibling.innerHTML;
  }
};

const submitNoteHandler = (e) => {
  e.preventDefault();
  // check if note is empty string
  if (input_input.value.trim() === "") {
    popupHandler("isError");
    return;
  }
  // action depending on editFlag state
  if (editFlag) {
    notes.edit(editID, input_input.value);
    popupHandler("isEdited");
  } else {
    notes.add(input_input.value);
    popupHandler("isAdded");
  }
  // reset states, save, render
  editFlag = false;
  editID = null;
  input_input.value = "";
  notes.save();
  render();
};

const menuHandler = (e) => {
  // filter missed clicks
  if (e.target.classList[0] === "menu") return;
  // reset highlight for menu btns
  [...e.target.parentNode.children].forEach((btn) =>
    btn.classList.remove("highlight")
  );
  // add highlight class for current menu tab
  e.target.classList.add("highlight");
  // set displayState and render
  const displayState = e.target.dataset.action;
  render(displayState);
};

const popupHandler = (msg) => {
  let timeoutFlag = null;
  switch (msg) {
    case "isError": {
      popup.innerHTML = "wrong input";
      popupError();
      break;
    }
    case "isEdited": {
      popup.innerHTML = "note edited";
      popupGreen();
      break;
    }
    case "isAdded": {
      popup.innerHTML = "note added";
      popupGreen();
      break;
    }
    case "isDeleted": {
      popup.innerHTML = "note deleted";
      popupError();
      break;
    }
    case "isDone": {
      popup.innerHTML = "Done!";
      popupGreen();
      break;
    }
  }

  if (popupTimer !== "undefined") clearTimeout(popupTimer);

  popupTimer = setTimeout(() => {
    popup.classList.remove("error");
    popup.classList.remove("green");
    popup.innerHTML = "";
  }, 2000);
};

const popupGreen = () => {
  popup.classList = ["popup"];
  popup.classList.add("green");
};

const popupError = () => {
  popup.classList = ["popup"];
  popup.classList.add("error");
};

// ********* INIT *********
(() => {
  // menu events
  menu_nav.addEventListener("click", menuHandler);
  // submit form events
  submit_form.addEventListener("submit", submitNoteHandler);
  // initial display
  render();
})();
