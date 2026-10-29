CREATE DATABASE support_notes_app;
USE support_notes_app;

CREATE TABLE saved_support_notes (
    id integer PRIMARY KEY AUTO_INCREMENT,
    contents TEXT NOT NULL,
    created TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO saved_support_notes (contents)
VALUES
('Test note 1'),
('Test note 2');