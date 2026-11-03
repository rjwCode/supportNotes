import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT
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

export async function deleteSavedNote(id){
    const [result] = await pool.query(`
        DELETE
        FROM saved_support_notes
        WHERE id = ?
    `, [id]);
    return result.affectedRows;
}

export async function updateSavedNote(id, newTextContent){
    const [result] = await pool.query(`
        UPDATE saved_support_notes
        SET contents = ?
        WHERE id = ?
    `, [newTextContent, id]);
    return result.affectedRows;
}

export async function createSavedNote(contents, user_uuid){
    const [result] = await pool.query(`
        INSERT INTO saved_support_notes (contents, user_uuid) 
        VALUES (?, ?)
        `, [contents, user_uuid]);
    
    const id = result.insertId;
    return getSavedNote(id);
}