// Import required modules 
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const NOTES_FILE = path.join(__dirname, 'notes.json');

// Read and write notes functions
function readNotes() {
  const data = fs.readFileSync(NOTES_FILE, 'utf8');
  return JSON.parse(data);
}

function writeNotes(notes) {
  fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2));
}

// Create HTTP server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  console.log(`${method} ${pathname}`);

  // Serve static files
  if (pathname.startsWith('/public/')) {
    const filePath = path.join(__dirname, pathname);
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath).substring(1);
      const contentType = {
        'html': 'text/html',
        'css': 'text/css',
        'js': 'text/javascript'
      }[ext] || 'text/plain';
      
      const data = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
    return;
  }

  // Serve HTML at root
  if (pathname === '/' && method === 'GET') {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    if (fs.existsSync(indexPath)) {
      const data = fs.readFileSync(indexPath);
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    } else {
      res.writeHead(500);
      res.end('Server Error');
    }
    return;
  }

  // API routes
  if (pathname === '/api/notes') {
    const notes = readNotes();

    if (method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(notes));
      return;
    }

    if (method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', () => {
        const newNote = JSON.parse(body);
        if (newNote && newNote.title && newNote.content) {
          newNote.id = Date.now().toString();
          notes.push(newNote);
          writeNotes(notes);
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(newNote));
        } else {
          res.writeHead(400);
          res.end('Title and content required');
        }
      });
      return;
    }
  }

  // Handle /api/notes/:id
  const noteIdMatch = pathname.match(/^\/api\/notes\/(\w+)$/);
  if (noteIdMatch) {
    const id = noteIdMatch[1];
    const notes = readNotes();
    const noteIndex = notes.findIndex(note => note.id === id);

    if (noteIndex === -1) {
      res.writeHead(404);
      res.end('Note not found');
      return;
    }

    if (method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(notes[noteIndex]));
      return;
    }

    if (method === 'PUT') {
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', () => {
        const updatedNote = JSON.parse(body);
        if (updatedNote && updatedNote.title && updatedNote.content) {
          notes[noteIndex] = { ...notes[noteIndex], ...updatedNote };
          writeNotes(notes);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(notes[noteIndex]));
        } else {
          res.writeHead(400);
          res.end('Title and content required');
        }
      });
      return;
    }

    if (method === 'DELETE') {
      notes.splice(noteIndex, 1);
      writeNotes(notes);
      res.writeHead(204);
      res.end();
      return;
    }
  }

  // Default 404 response
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('404 Not Found');
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});