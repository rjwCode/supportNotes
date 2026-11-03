import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import cookieParser from 'cookie-parser';
import serveFavicon from 'serve-favicon';
import { getSavedNote, getSavedNotes, createSavedNote, deleteSavedNote, updateSavedNote } from './database.js';

const app = express();
const port = 8080;

app.use(express.json());
app.use(cookieParser());
app.use(express.static('assets'));
app.use(serveFavicon('assets/favicon.ico'));
app.use(express.static('public'));

app.get("/api/init_user", async (req, res) => {
  if(!req.cookies.uuid){
    res.cookie('uuid', uuidv4(), {
      maxAge: 31536000000,
      httpOnly: true
    });
  }

  res.send();
});

app.get("/savedNotes", async (req, res) => {
  const userUUID = req.cookies?.uuid;
  const savedNotes = await getSavedNotes();

  if(userUUID){
    const userNotes = savedNotes.filter((note) => note.user_uuid == userUUID);
    userNotes.forEach(note => {
      note.isOwner = true;
    });
  }

  res.send(savedNotes); 
});

app.post("/savedNotes", async (req, res) => {
  const {contents} = req.body;
  const uuid = req.cookies.uuid;
  const newSavedNote = await createSavedNote(contents, uuid);
  console.log(newSavedNote);
  res.status(201).send(newSavedNote);
});

app.get("/savedNote/:id", async (req, res) => {
  const id = req.params.id;
  const savedNote = await getSavedNote(id);
  res.send(savedNote);
});

app.delete("/deleteSavedNote/:id", async (req, res) => {
  const id = req.params.id;
  const user_uuid = req.cookies.uuid;

  const noteToDelete = await getSavedNote(id);

  if(user_uuid == noteToDelete.user_uuid){
    await deleteSavedNote(id);
    res.send()
  } else{
    res.status(403).send();
  }
});

app.put("/updateSavedNote/:id", async (req, res) => {
  const id = req.params.id;
  const newTextContent = req.body.newContent;
  const user_uuid = req.cookies.uuid;

  const noteToUpdate = await getSavedNote(id);

  if(user_uuid == noteToUpdate.user_uuid){
    await updateSavedNote(id, newTextContent);
    res.send()
  } else{
    res.status(403).send();
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Example app listening on port ${port}!`);
});