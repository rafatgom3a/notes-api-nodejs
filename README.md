# 📝 simple-notes-api

This is a basic Notes API built using pure Node.js without using any frameworks like Express. It allows you to create, read, update, and delete notes, all stored in a JSON file.

## Features

- Built using Node.js http module
- Stores notes in a local notes.json file
- Supports basic CRUD operations:
  - GET /api/notes - Get all notes
  - GET /api/notes/:id - Get note by ID
  - POST /api/notes - Create a new note
  - PUT /api/notes/:id - Update a note
  - DELETE /api/notes/:id - Delete a note
- Serves a static HTML page at the root with basic frontend
- Handles errors for missing routes and server issue
s
