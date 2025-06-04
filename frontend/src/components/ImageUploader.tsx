import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ItemDTO from '../types/ItemDTO';
import Button from './ui/Button';

export default function ImageUploader() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      navigate('/recommendedOutfit');
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  }

  return (
    <div className='mt-10 flex flex-col items-center space-y-6'>
      {!preview && (
        <>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className='flex h-[250px] w-[400px] items-center justify-center rounded-lg border-2 border-dashed border-gray-400 bg-white shadow-md'
          >
            <p className='text-center text-gray-600'>Arrastrá una imagen</p>
          </div>
          <div className='mt-6'>
            <Button text='Seleccionar imagen' onClick={handleButtonClick} />
            <input
              type='file'
              accept='image/*'
              ref={fileInputRef}
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>
        </>
      )}

      {preview && (
        <>
          <img
            src={preview}
            alt='Preview'
            className='mb-6 max-h-[300px] max-w-[400px] rounded border object-contain'
          />
          <div className='mt-6 flex justify-center gap-6 p-6'>
            <Button text='Subir' onClick={handleUpload} />
            <Button text='Eliminar' onClick={handleRemove} />
          </div>
        </>
      )}
    </div>
  );
}
