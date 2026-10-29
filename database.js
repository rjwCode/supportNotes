import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise()

export async function getSavedNotes(){
    const [rows] = await pool.query("SELECT * FROM saved_support_notes");
    return rows;
}

export async function getSavedNote(id){
    const [rows] = await pool.query(`
        SELECT *
        FROM saved_support_notes
        WHERE id = ?
    `, [id]);
    return rows[0];
}

export async function createSavedNote(contents){
    const [result] = await pool.query(`
        INSERT INTO saved_support_notes (contents) 
        VALUES (?)
        `, contents);
    
    const id = result.insertId;
    return getSavedNote(id);
}

// const result = await createSavedNote('Test adding note 3');
// console.log(result);

// console.log(await getSavedNote(1));