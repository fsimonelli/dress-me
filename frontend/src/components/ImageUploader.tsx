import { useState, useRef } from 'react';
import ItemDTO from '../types/ItemDTO';
import Button from './ui/Button';

export default function ImageUploader() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState<string | null>(null);
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

  async function handleUpload() {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('http://localhost:8000/uploadItem/', {
        method: 'POST',
        body: formData,
      }).then((res) => res.json());

      const similarItems: ItemDTO[] = response[1]['points'].map(
        (qdrantItem) => ({
          outfit_id: qdrantItem['payload']['outfit_id'],
          item_idx: qdrantItem['payload']['item_idx'],
          keywords: qdrantItem['payload']['keywords'],
          category: qdrantItem['payload']['category'],
        }),
      );

      const suggestedOutfit: ItemDTO[] = response[0];
      console.log('Suggested Outfit:', suggestedOutfit);
      console.log('Similar Items:', similarItems);
      localStorage.setItem('similarItems', JSON.stringify(similarItems));
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  }

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
          <Button text='Seleccionar imagen' onClick={handleButtonClick} />
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
            <Button text='Subir' onClick={handleUpload} />
            <Button text='Eliminar' onClick={handleRemove} />
          </div>
        </div>
      )}
    </div>
  );
}
