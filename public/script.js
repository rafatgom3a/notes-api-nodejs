document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const noteForm = document.getElementById('noteForm');
    const notesList = document.getElementById('notesList');
    const titleInput = document.getElementById('title');
    const contentInput = document.getElementById('content');
    const noteIdInput = document.getElementById('noteId');
    const submitBtn = document.getElementById('submitBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    
    let isEditing = false;
  
    // Function to fetch all notes
    const fetchNotes = async () => {
      try {
        const response = await fetch('/api/notes');
        if (!response.ok) throw new Error('Failed to fetch notes');
        const notes = await response.json();
        renderNotes(notes);
      } catch (error) {
        console.error('Error:', error);
        notesList.innerHTML = '<p>Error loading notes. Please try again.</p>';
      }
    };
  
    // Function to render notes to the DOM
    const renderNotes = (notes) => {
      if (notes.length === 0) {
        notesList.innerHTML = '<p>No notes yet. Add your first note!</p>';
        return;
      }
  
      notesList.innerHTML = notes.map(note => `
        <div class="note" data-id="${note.id}">
          <h3>${note.title}</h3>
          <p>${note.content}</p>
          <div class="note-actions">
            <button class="edit-btn">Edit</button>
            <button class="delete-btn">Delete</button>
          </div>
        </div>
      `).join('');
  
      // Add event listeners to edit and delete buttons
      document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const noteElement = e.target.closest('.note');
          const id = noteElement.dataset.id;
          const title = noteElement.querySelector('h3').textContent;
          const content = noteElement.querySelector('p').textContent;
          
          startEditing(id, title, content);
        });
      });
  
      document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const noteElement = e.target.closest('.note');
          const id = noteElement.dataset.id;
          
          try {
            const response = await fetch(`/api/notes/${id}`, {
              method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Failed to delete note');
            fetchNotes();
          } catch (error) {
            console.error('Error:', error);
            alert('Failed to delete note');
          }
        });
      });
    };
  
    // Function to start editing a note
    const startEditing = (id, title, content) => {
      isEditing = true;
      noteIdInput.value = id;
      titleInput.value = title;
      contentInput.value = content;
      submitBtn.textContent = 'Update Note';
      cancelBtn.style.display = 'inline-block';
    };
  
    // Function to cancel editing
    const cancelEditing = () => {
      isEditing = false;
      noteForm.reset();
      noteIdInput.value = '';
      submitBtn.textContent = 'Save Note';
      cancelBtn.style.display = 'none';
    };
  
    // Function to handle form submission
    const handleSubmit = async (event) => {
      event.preventDefault();
      
      const title = titleInput.value.trim();
      const content = contentInput.value.trim();
      const id = noteIdInput.value;
      
      if (!title || !content) {
        alert('Please fill in both title and content');
        return;
      }
      
      const noteData = { title, content };
      
      try {
        let response;
        
        if (isEditing) {
          response = await fetch(`/api/notes/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(noteData)
          });
        } else {
          response = await fetch('/api/notes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(noteData)
          });
        }
        
        if (!response.ok) throw new Error(isEditing ? 'Failed to update note' : 'Failed to create note');
        
        const result = await response.json();
        console.log(isEditing ? 'Note updated:' : 'Note created:', result);
        
        cancelEditing();
        fetchNotes();
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
      }
    };
  
    // Add event listeners
    noteForm.addEventListener('submit', handleSubmit);
    cancelBtn.addEventListener('click', cancelEditing);
    
    // Initial fetch
    fetchNotes();
  });