import express from 'express';
import { getSavedNote, getSavedNotes, createSavedNote } from './database.js';

const app = express();
const port = 8080;

app.use(express.json());

app.get("/savedNotes", async (req, res) => {
  const savedNotes = await getSavedNotes();
  res.send(savedNotes); 
});

app.post("/savedNotes", async (req, res) => {
  const {contents} = req.body;
  const newSavedNote = await createSavedNote(contents);
  console.log(newSavedNote);
  res.status(201).send(newSavedNote);
})

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
})

app.use(express.static('assets'));
app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});