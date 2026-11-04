(async () => {
    await initUser();
})();

let savedNotes = [];
let nextNoteId;
let noteCounter;

if(!localStorage.getItem('nextNoteId')){
    localStorage.setItem('nextNoteId', 0);
    nextNoteId = 0;
}else{
    nextNoteId = localStorage.getItem('nextNoteId');
}

if(!localStorage.getItem('notes')){
    localStorage.setItem('notes', JSON.stringify([]));
} else{
    let localNotes = JSON.parse(localStorage.getItem('notes'));
    localNotes.forEach((note) => {
        displayExistingNote(note);
    })
}

if(!localStorage.getItem('noteCount')){
    localStorage.setItem('noteCount', 0);
    noteCounter = 0;
} else{
    noteCounter = localStorage.getItem('noteCount');
}

checkForNoNotes();

let viewNotesButton = document.querySelector('.supportNotesViewButton');
viewNotesButton.addEventListener('click', () => {
    viewNotes();
});

let closeNotesModalButton = document.querySelector('.closeNotesModal');
closeNotesModalButton.addEventListener('click', () => {
    closeNotesModal();
});

let outerDivArray = Array.from(document.querySelectorAll('.mydiv'));
outerDivArray.forEach((element) => dragElement(element));

let newNoteButton = document.querySelector('.newNoteButtonImage');

function closeNotesModal(){
    let notesModal = document.querySelector('.supportNotesModal');
    notesModal.style.display = "none";

    let noteSpace = document.querySelector('.noteSpace');
    noteSpace.style.pointerEvents = "all";

    let overlay = document.querySelector('.overlay');
    overlay.style.display = "none";
}

async function viewNotes(){
    const getNotesResult = await fetch('/savedNotes', {
        method: "GET"
    });
    const resultJson = await getNotesResult.json();
    const resultArray = Array.from(resultJson);
    let notesSection = document.querySelector('.notesSection');
    notesSection.innerHTML = '';

    resultArray.forEach((note) => {
        if (note.isOwner == true){
            let noteDiv = document.createElement("div");
            noteDiv.id = note.id;
            noteDiv.style = "overflow-y: scroll; border: 3px solid black; overflow-wrap: break-word; margin-left: auto; margin-right: auto; margin-top: 10px; margin-bottom: 10px; padding-left: auto; padding-right: auto; padding-top: 10px; padding-bottom: 10px; text-align: center; font-size: x-large; width: 250px; height: 250px; background-color: teal; color: black";
            
            let buttonDiv = document.createElement("div");
            buttonDiv.style = "position: relative; top: 0; left: 0; width: 100%; height: 40px; margin-left: 0px; background-color: tan; align-content: center; border-bottom: 3px solid black;";
            noteDiv.appendChild(buttonDiv);

            let sharedUpdateButton = document.createElement("button");
            sharedUpdateButton.style = "top: 0; left: 0; width: 65px; height: 25px; margin-left: 140px; font-size: large;";
            sharedUpdateButton.textContent = "Edit";
            sharedUpdateButton.addEventListener('click', async () => {
                let savedNoteParagraph = sharedUpdateButton.parentElement.parentElement.querySelector('.savedNoteParagraph');
                if(sharedUpdateButton.textContent === "Edit"){
                    savedNoteParagraph.contentEditable = "true";
                    sharedUpdateButton.textContent = "Update";
                } else if(sharedUpdateButton.textContent === "Update"){
                    const response = await fetch(`/updateSavedNote/${noteDiv.id}`, {
                        method: "PUT",
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({newContent: savedNoteParagraph.textContent})
                    });
                    if(response.ok){
                        savedNoteParagraph.contentEditable = "false";
                        sharedUpdateButton.textContent = "Edit";
                    } else{
                        alert("Failed to update note!");
                    }

                }
            })

            let sharedDeleteButton = document.createElement("button");
            sharedDeleteButton.style = "top: 0; left: 0; width: 25px; height: 25px; margin-left: 10px; font-size: large;";
            sharedDeleteButton.textContent = "X";
            sharedDeleteButton.addEventListener('click', () => {
                deleteSharedNote(sharedDeleteButton);
            })
            buttonDiv.appendChild(sharedUpdateButton);
            buttonDiv.appendChild(sharedDeleteButton);
            
            
            let paragraphDiv = document.createElement("div");
            paragraphDiv.style = "overflow-y: scroll; width: 250px; height: 240px;";
            let sharedNoteParagraph = document.createElement("p");
            sharedNoteParagraph.style = "overflow-wrap: break-word; overflow-y: scroll; overflow-wrap: break-word; text-align: center; margin: 0px; padding-left: 10px; padding-right: 10px; padding-top: 10px; top: 10;";
            sharedNoteParagraph.textContent = note.contents;
            sharedNoteParagraph.className = "savedNoteParagraph";
            paragraphDiv.appendChild(sharedNoteParagraph);

            noteDiv.appendChild(paragraphDiv);

            notesSection.appendChild(noteDiv);
        }
        else{
            let notesSection = document.querySelector('.notesSection');
            let noteDiv = document.createElement("div");
            noteDiv.textContent = note.contents;
            noteDiv.style = "overflow-y: scroll; border: 3px solid black; word-wrap: break-word; margin-top: 10px; margin-bottom: 10px; margin-left: auto; margin-right: auto; padding-top: 10px; padding-bottom: 10px; padding-right: auto; padding-left: auto; text-align: center; font-size: x-large; width: 250px; height: 250px; background-color: teal; color: black;";
            notesSection.appendChild(noteDiv);
        }
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

    const storedNotes = JSON.parse(localStorage.getItem('notes'));
    let filteredNotes = storedNotes.filter((note) => note.id != noteToDeleteId);
    localStorage.setItem('notes', JSON.stringify(filteredNotes));
    noteCounter--;
    localStorage.setItem('noteCount', noteCounter);

    noteDivElement.remove();
    checkForNoNotes();
}

async function saveNote(element){
    let noteOuterDiv = element.parentElement.parentElement;
    let noteText = noteOuterDiv.querySelector('.noteText').value;
    savedNotes.push(noteText);
    
    await fetch('/savedNotes', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({contents: noteText})
    });

    deleteNote(element);
}

function dragElement(element) {
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

        let deltaX = pos3 - e.clientX;
        let deltaY = pos4 - e.clientY;

        let oldLeft = element.offsetLeft;
        let oldTop = element.offsetTop;
        
        let minX = 0;
        let minY = 0;
        let maxX = document.documentElement.clientWidth - element.offsetWidth;
        let maxY = document.documentElement.clientHeight - element.offsetHeight;

        let newTop = Math.max(minY, Math.min(oldTop - deltaY, maxY));
        let newLeft = Math.max(minX, Math.min(oldLeft - deltaX, maxX));

        element.style.left = newLeft + "px";
        element.style.top = newTop + "px";

        if(oldLeft !== newLeft){
            pos3 = e.clientX;
        }
        if(oldTop !== newTop){
            pos4 = e.clientY;
        }
    }

    async function closeDragElement(){
        let localNotes = JSON.parse(localStorage.getItem('notes'));
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

    noteCounter++;
    localStorage.setItem('noteCount', noteCounter);

    script_parent.insertBefore(noteHeader, script);
    addTextAreaListener(noteHeader);
    addResizeObserver(noteHeader);
    dragElement(noteHeader);
    checkForNoNotes();
}

function displayExistingNote(note){
    let id = note.id;
    let posx = note.posx;
    let posy = note.posy;
    let content = note.content;
    let textAreaWidth = note.textAreaWidth;
    let textAreaHeight = note.textAreaHeight;

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
    let textArea = element.querySelector('.noteText');
    textArea.addEventListener('input', async () => {
        let localNotes = JSON.parse(localStorage.getItem('notes')) || [];
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
        let maxWidth = window.innerWidth - cr.left;
        let maxHeight = window.innerHeight - cr.top;

        if(cr.width > maxWidth){
            element.style.width = `${maxWidth}px`;
        }
        if(cr.height > maxHeight){
            element.style.height = `${maxHeight}px`;
        }

        let localNotes = JSON.parse(localStorage.getItem('notes')) || [];
        let filtered = localNotes.filter((note) => note.id == element.id);

        if(filtered[0]){
            filtered[0].textAreaHeight = cr.height + "px";
            filtered[0].textAreaWidth = cr.width + "px";
        }
        localStorage.setItem('notes', JSON.stringify(localNotes));
    });
    ro.observe(textArea);
}

async function initUser(){
    await fetch('/api/init_user');
}

async function deleteSharedNote(element){
    const sharedNote = element.parentElement.parentElement;
    const id = sharedNote.id;
    const response = await fetch(`/deleteSavedNote/${id}`, {
        method: 'DELETE'
    });
    
    const notesSection = document.querySelector('.notesSection');
    if(response.ok){
        notesSection.removeChild(sharedNote);
    }
}

function checkForNoNotes(){
    let noNotesGraphic = document.querySelector('.noNotesGraphic');
    if(Number(localStorage.getItem('noteCount')) !== 0){
        noNotesGraphic.style.display = "none";
    }else{
        noNotesGraphic.style.display = "flex";
    }
}