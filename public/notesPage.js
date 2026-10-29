let savedNotes = [];
//let currentNotes = [];
let nextNoteId;

if(!localStorage.getItem('nextNoteId')){
    console.log("couldn't find next id");
    localStorage.setItem('nextNoteId', 0);
    nextNoteId = 0;
}else{
    nextNoteId = localStorage.getItem('nextNoteId');
}

if(!localStorage.getItem('notes')){
    localStorage.setItem('notes', JSON.stringify([]));
} else{
    //currentNotes = await JSON.parse(localStorage.getItem('notes'));
    let localNotes = JSON.parse(localStorage.getItem('notes'));
    localNotes.forEach((note) => {
        displayExistingNote(note);
    })
}

let viewNotesButton = document.querySelector('.supportNotesViewButton');
viewNotesButton.addEventListener('click', () => {
    viewNotes();
});

let closeNotesModalButton = document.querySelector('.closeNotesModal');
closeNotesModalButton.addEventListener('click', () => {
    console.log("CLOSED");
    closeNotesModal();
});

let outerDivArray = Array.from(document.querySelectorAll('.mydiv'));
outerDivArray.forEach((element) => dragElement(element));

let newNoteButton = document.querySelector('.newNoteButtonImage');

//This was causing there to be duplicate event listeners on the note buttons
// outerDivArray.forEach((element) => {
//     let deleteButton = element.querySelector('.deleteNoteButton');
//     let saveButton = element.querySelector('.saveNoteButton');
//     deleteButton.addEventListener('click', () => {
//         deleteNote(deleteButton);
//     });
//     saveButton.addEventListener('click', () => {
//         saveNote(saveButton);
//     });
// });

function closeNotesModal(){
    let notesModal = document.querySelector('.supportNotesModal');
    notesModal.style.display = "none";

    let noteSpace = document.querySelector('.noteSpace');
    noteSpace.style.pointerEvents = "all";

    let overlay = document.querySelector('.overlay');
    overlay.style.display = "none";
}

async function viewNotes(){
    console.log("hi");
    const getNotesResult = await fetch('http://localhost:8080/savedNotes', {
        method: "GET"
    });
    const resultJson = await getNotesResult.json();
    const resultArray = Array.from(resultJson);
    resultArray.forEach((note) => {
        // TO-DO: look into session / session id (view 4 in TO-DO section)
        // if (session = user's session){
        //     create note with close button instead
        //     add event listener to button
        //     create delete function somewhere else in this file
        // }
        let notesSection = document.querySelector('.notesSection');
        let noteDiv = document.createElement("div");
        noteDiv.textContent = note.contents;
        noteDiv.style = "overflow-y: scroll; border: 3px solid black; word-wrap: break-word; margin-top: 15px; margin-left: 38px; margin-right: 20px; padding-top: 15px; padding-bottom: 15px; text-align: center; font-size: x-large; width: 250px; height: 250px; background-color: teal; color: black;";
        notesSection.appendChild(noteDiv);
    })

    let supportNotesModal = document.querySelector('.supportNotesModal');
    supportNotesModal.style.display = "block";

    let noteSpace = document.querySelector('.noteSpace');
    noteSpace.style.pointerEvents = "none";

    let overlay = document.querySelector('.overlay');
    overlay.style.display = "block";
}

async function deleteNote(element){
    let noteDivElement = element.parentElement.parentElement;
    let noteToDeleteId = noteDivElement.id;

    const storedNotes = await JSON.parse(localStorage.getItem('notes'));
    let filteredNotes = storedNotes.filter((note) => note.id != noteToDeleteId);
    localStorage.setItem('notes', JSON.stringify(filteredNotes));

    noteDivElement.remove();
}

async function saveNote(element){
    let noteOuterDiv = element.parentElement.parentElement;
    console.log(noteOuterDiv);
    let noteText = noteOuterDiv.querySelector('.noteText').value;
    console.log("NOTE TEXT: " + noteText);
    savedNotes.push(noteText);
    
    await fetch('http://localhost:8080/savedNotes', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({contents: noteText})
    });

    deleteNote(element);
}

function dragElement(element) {
    console.log("I ran");
    let pos1 = 0;
    let pos2 = 0;
    let pos3 = 0;
    let pos4 = 0;

    if (element.querySelector('.mydivheader')){
        element.querySelector('.mydivheader').onmousedown = dragMouseDown;
    } else{
        element.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e){
        e = e || window.event;
        e.preventDefault();

        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;

        document.onmousemove = elementDrag;
    }

    function elementDrag(e){
        e = e || window.event;
        e.preventDefault();

        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;

        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }

    async function closeDragElement(){
        console.log("TOP " + element.style.top);
        console.log("LEFT " + element.style.left);
        
        let localNotes = await JSON.parse(localStorage.getItem('notes'));
        let filtered = localNotes.filter((note) => note.id == element.id);
        filtered[0].posx = element.style.left;
        filtered[0].posy = element.style.top;
        localStorage.setItem('notes', JSON.stringify(localNotes));

        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function createNewNoteElement(){
    const maxY = 400;
    const maxX = 400;
    const minY = 100;
    const minX = 100;

    const script = document.getElementById("myscript");
    const script_parent = script.parentElement;


    let noteHeader = document.createElement("div");
    noteHeader.setAttribute("id", nextNoteId);
    noteHeader.setAttribute("class", "mydiv");

    let noteBody = document.createElement("div");
    noteBody.setAttribute("style", "width:auto");
    noteBody.setAttribute("class", "mydivheader");

    let deleteButton = document.createElement("button");
    let saveButton = document.createElement("button");

    deleteButton.setAttribute("class", "deleteNoteButton");
    deleteButton.textContent = "X";
    saveButton.setAttribute("class", "saveNoteButton");
    saveButton.textContent = "Save";

    deleteButton.addEventListener('click', () => {
        deleteNote(deleteButton);
    });

    saveButton.addEventListener('click', () => {
        saveNote(saveButton);
    })

    noteBody.appendChild(deleteButton);
    noteBody.appendChild(saveButton);

    noteHeader.appendChild(noteBody);

    let noteTextArea = document.createElement("textarea");
    noteTextArea.setAttribute("class", "noteText");

    noteHeader.appendChild(noteTextArea);

    noteHeader.style.top = (Math.random() * (maxY - minY) + minY) + "px";
    noteHeader.style.left = (Math.random() * (maxX - minX) + minX) + "px";

    let localNotes = JSON.parse(localStorage.getItem('notes'));


    localNotes.push({
        "id": nextNoteId,
        "content": noteTextArea.textContent,
        "posx": noteHeader.style.left,
        "posy": noteHeader.style.top,
        "textAreaWidth": "0px",
        "textAreaHeight": "0px"
    })

    localStorage.setItem('notes', JSON.stringify(localNotes));

    nextNoteId++;
    localStorage.setItem('nextNoteId', nextNoteId);

    script_parent.insertBefore(noteHeader, script);
    addTextAreaListener(noteHeader);
    addResizeObserver(noteHeader);
    dragElement(noteHeader);
}

function displayExistingNote(note){
    let id = note.id;
    let posx = note.posx;
    let posy = note.posy;
    let content = note.content;
    let textAreaWidth = note.textAreaWidth;
    let textAreaHeight = note.textAreaHeight;
    console.log("Height " + textAreaHeight);
    console.log("Width " + textAreaWidth);

    const script = document.getElementById("myscript");
    const script_parent = script.parentElement;


    let noteHeader = document.createElement("div");
    noteHeader.setAttribute("id", id);
    noteHeader.setAttribute("class", "mydiv");

    let noteBody = document.createElement("div");
    noteBody.setAttribute("style", "width:auto");
    noteBody.setAttribute("class", "mydivheader");

    let deleteButton = document.createElement("button");
    let saveButton = document.createElement("button");

    deleteButton.setAttribute("class", "deleteNoteButton");
    deleteButton.textContent = "X";
    saveButton.setAttribute("class", "saveNoteButton");
    saveButton.textContent = "Save";

    deleteButton.addEventListener('click', () => {
        deleteNote(deleteButton);
    });

    saveButton.addEventListener('click', () => {
        saveNote(saveButton);
    })

    noteBody.appendChild(deleteButton);
    noteBody.appendChild(saveButton);

    noteHeader.appendChild(noteBody);

    let noteTextArea = document.createElement("textarea");
    noteTextArea.setAttribute("class", "noteText");
    noteTextArea.textContent = content;
    noteTextArea.style.width = textAreaWidth;
    noteTextArea.style.height = textAreaHeight;

    noteHeader.appendChild(noteTextArea);

    noteHeader.style.top = posy;
    noteHeader.style.left = posx;

    script_parent.insertBefore(noteHeader, script);
    addResizeObserver(noteHeader);
    addTextAreaListener(noteHeader);
    dragElement(noteHeader);
}

async function addTextAreaListener(element){
    console.log("Made it to text area function");
    let textArea = element.querySelector('.noteText');
    textArea.addEventListener('input', async () => {
        let localNotes = await JSON.parse(localStorage.getItem('notes'));
        let filtered = localNotes.filter((note) => note.id == element.id);
        filtered[0].content = textArea.value;
        localStorage.setItem('notes', JSON.stringify(localNotes));
    });
}

async function addResizeObserver(element){
    let textArea = element.querySelector('.noteText');
    var ro = new ResizeObserver(async entries => {
        let entry = entries[0];
        const cr = entry.contentRect;

        let localNotes = await JSON.parse(localStorage.getItem('notes'));
        let filtered = localNotes.filter((note) => note.id == element.id);
        filtered[0].textAreaHeight = cr.height + "px";
        filtered[0].textAreaWidth = cr.width + "px";
        localStorage.setItem('notes', JSON.stringify(localNotes));
    });
    ro.observe(textArea);
}
// TO-DO: Implement HttpOnly cookie for delete and update functions for shared notes (4)