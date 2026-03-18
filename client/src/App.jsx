import React, { useState, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import axios from 'axios';

const App = () => {
  const [files, setFiles] = useState([]);
  
  const handleFileChange = async (event) => {
    const uploadedFiles = Array.from(event.target.files);
    const newFiles = uploadedFiles.filter(file => file.type === 'application/pdf');
    
    // Here you would typically send the files to the backend
    const formData = new FormData();
    newFiles.forEach(file => formData.append('files', file));
    
    try {
      const response = await axios.post('/api/upload', formData);
      setFiles(prevFiles => [...prevFiles, ...response.data.files]); // Assuming the response contains the uploaded files
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };

  const removeFile = (fileName) => {
    setFiles(files.filter(file => file.name !== fileName));
  };

  const handleMerge = async () => {
    try {
      await axios.post('/api/merge', { files: files.map(file => file.name) });
      alert('Files merged successfully!');
    } catch (error) {
      console.error('Error merging files:', error);
    }
  };

  const [, drop] = useDrop(() => ({
    accept: 'file',
    drop: (item) => {
      setFiles(files => {
        const newFiles = [...files];
        const [removed] = newFiles.splice(item.index, 1);
        newFiles.splice(item.newIndex, 0, removed);
        return newFiles;
      });
    },
  }));

  return (
    <div ref={drop}>
      <input type="file" accept=".pdf" multiple onChange={handleFileChange} />
      <ul>
        {files.map((file, index) => (
          <li key={file.name} index={index}>
            {file.name}
            <button onClick={() => removeFile(file.name)}>Remove</button>
          </li>
        ))}
      </ul>
      <button onClick={handleMerge}>Merge Files</button>
    </div>
  );
};

export default App;