// DOM Select
const menu_nav = document.querySelector(".menu");
const submit_form = document.querySelector(".submit-form");
const input_input = document.querySelector(".input");
const notesContainer_div = document.querySelector(".notes-container");

// Class
class Notes {
  constructor() {
    this.active = [];
    this.done = [];
    this.deleted = [];

    this.loadNotes();
    console.log(this.active);
  }

  loadNotes() {
    this.active = JSON.parse(localStorage.getItem("active-notes")) || [];
    this.done = JSON.parse(localStorage.getItem("done-notes")) || [];
    this.deleted = JSON.parse(localStorage.getItem("deleted-notes")) || [];
  }

  saveNotes() {
    localStorage.setItem("active-notes", JSON.stringify(this.active));
    localStorage.setItem("done-notes", JSON.stringify(this.done));
    localStorage.setItem("deleted-notes", JSON.stringify(this.deleted));
  }

  addNote(text) {
    const id = this.IDGenerator();
    this.active.push({ id, text });
  }

  moveToDeleted(id) {
    this.active = this.active.filter((el) => {
      this.deleted.push(el);
      return el.id !== id;
    });
  }

  moveToDone(id) {
    this.active = this.active.filter((el) => {
      this.done.push(el);
      return el.id !== id;
    });
  }

  IDGenerator() {
    return performance.now().toString(36);
  }
}

// Global constants and variables
let displayState = "show-active";
const notes = new Notes();

//********* functions ******
const notesCheckboxHandler = (e) => {
  e.preventDefault();
  console.log(e.currentTarget.parentNode.id);
  notes.moveToDone(e.currentTarget.parentNode.id);
  notes.saveNotes();
};

const noteOptionHandler = (e) => {
  e.preventDefault();
  console.log(e.currentTarget);

  if (e.currentTarget.dataset.action === "moveToDeleted-note") {
    notes.moveToDeleted(e.currentTarget.parentNode.parentNode.id);
  }
  notes.saveNotes();
  displayHandler();
  notes.saveNotes();
};

const submitNoteHandler = (e) => {
  e.preventDefault();
  //   if (input_input.value.tri !== '')
  if (input_input.value.trim() != "") {
    notes.addNote(input_input.value);
    input_input.value = "";
    notes.saveNotes();
    displayHandler();
  } else {
    console.log("wpisz wartosc menelu");
    notes.saveNotes();
  }
};

const render = (array) => {
  // note display part
  notesContainer_div.innerHTML = "";
  array.forEach((el) => {
    const newElement = document.createElement("form");
    newElement.id = el.id;
    newElement.classList.add("note");
    newElement.innerHTML = `<input type="checkbox" name="checkbox" class='checkbox'>
                    <label class="note__text">${el.text}</label>
                    <div class="note__options">
                        <button type="submit" data-action="edit-note" class="btn note__btn">
                            <svg viewBox="0 0 58 58" width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path d="M8.071 21.586l-7.071 1.414 1.414-7.071 14.929-14.929 5.657 5.657-14.929 14.929zm-.493-.921l-4.243-4.243-1.06 5.303 5.303-1.06zm9.765-18.251l-13.3 13.301 4.242 4.242 13.301-13.3-4.243-4.243z"/></svg>
                        </button>
                        <button type="submit" data-action="moveToDeleted-note" class="btn note__btn">
                            <svg viewBox="0 0 58 58" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                <path
                                d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z" />
                            </svg>
                        </button>
                    </div>`;
    notesContainer_div.appendChild(newElement);
    // event listeners for every single note
    [...notesContainer_div.children].forEach((note) => {
      [...note].forEach((el) => {
        if (el.name === "checkbox") {
          el.addEventListener("change", notesCheckboxHandler);
        } else {
          el.addEventListener("click", noteOptionHandler);
        }
      });
    });
  });

  // menu display part
};

const displayHandler = (e = null) => {
  e.stopPropagation();
  let currentDisplay = null;
  if (e) {
    currentDisplay = e.target.dataset.action;
  } else {
    console.log("qwa");
    currentDisplay = displayState;
  }
  console.log(e.currentTarget);
  currentDisplay === "show-active"
    ? render(notes.active)
    : currentDisplay === "show-done"
    ? render(notes.done)
    : currentDisplay === "show-deleted"
    ? render(notes.deleted)
    : "";
  displayState = currentDisplay;
};

const init = () => {
  // menu events
  console.log(...menu_nav.children);
  menu_nav.addEventListener("click", displayHandler);
  // submit form events
  submit_form.addEventListener("submit", (e) => submitNoteHandler(e, notes));
  // initial display
  displayHandler();
};

init();
