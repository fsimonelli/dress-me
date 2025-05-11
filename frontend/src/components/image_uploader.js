import React, { useState, useRef } from "react";

export default function ImageDropzone() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null); // ✅ Paso 1


  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      setFile(droppedFile);
      setPreview(URL.createObjectURL(droppedFile));
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith("image/")) {
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
    formData.append("image", file);
    fetch("/api/upload", {
      method: "POST",
      body: formData,
    })
      .then(() => console.log("Imagen subida"))
      .catch((err) => console.error("Error al subir", err));
  };

  return (
    <div className="p-6 max-w-md mx-auto">

      {!preview && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-dashed border-4 border-gray-300 rounded-lg w-96 h-48 flex items-center justify-center cursor-pointer hover:bg-gray-100"
        >
          <p className="text-gray-600 text-center">
            Arrastrá una imagen 
          </p>
        </div>
      )}

      {!preview && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleButtonClick}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Seleccionar imagen
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />
        </div>
      )}

      {preview && (
        <div className="mt-4">
          <img
            src={preview}
            alt="Preview"
            className="w-full max-h-64 object-contain rounded border"
          />
          <div className="flex justify-between mt-2">
            <button
              onClick={handleUpload}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Subir
            </button>
            <button
              onClick={handleRemove}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Eliminar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
