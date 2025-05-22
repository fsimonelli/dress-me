import React, { useState, useRef } from 'react';

export default function ImageDropzone() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile);
      setPreview(URL.createObjectURL(droppedFile));
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
  };

  const handleUpload = () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })
      .then(() => console.log('Imagen subida'))
      .catch((err) => console.error('Error al subir', err));
  };

  return (
    <div className='mx-auto max-w-md p-6'>
      {!preview && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className='flex h-48 w-96 cursor-pointer items-center justify-center rounded-lg border-4 border-dashed border-gray-300 hover:bg-gray-100'
        >
          <p className='text-center text-gray-600'>Arrastrá una imagen</p>
        </div>
      )}

      {!preview && (
        <div className='mt-4 flex justify-center'>
          <button
            onClick={handleButtonClick}
            className='rounded bg-blue-600 px-4 py-2 text-white'
          >
            Seleccionar imagen
          </button>
          <input
            type='file'
            accept='image/*'
            ref={fileInputRef}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {preview && (
        <div className='mt-4'>
          <img
            src={preview}
            alt='Preview'
            className='max-h-64 w-full rounded border object-contain'
          />
          <div className='mt-2 flex justify-between'>
            <button
              onClick={handleUpload}
              className='rounded bg-blue-600 px-4 py-2 text-white'
            >
              Subir
            </button>
            <button
              onClick={handleRemove}
              className='rounded bg-red-500 px-4 py-2 text-white'
            >
              Eliminar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
