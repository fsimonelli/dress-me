import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ItemDTO from '../types/ItemDTO';
import Button from './ui/Button';
import LoadingIndicator from './ui/LoadingIndicator';

export default function ImageUploader() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleClick = () => {
    handleUpload();
    setIsLoading(true);
  };

  async function handleUpload() {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:8000/uploadItem/', {
        method: 'POST',
        body: formData,
      });

      const response = await res.json();
      const recommended_outfit: ItemDTO[] = response[0].map((outfit) => {
        return {
          outfit_id: outfit['outfit_id'],
          item_idx: outfit['item_idx'],
          keywords: outfit['keywords'],
          category: outfit['category'],
          imageUrl: `http://127.0.0.1:8000/get_image/${outfit['outfit_id']}/${outfit['item_idx']}`,
        };
      });

      const similarItems: ItemDTO[] = response[1]['points'].map((item) => ({
        outfit_id: item['payload']['outfit_id'],
        item_idx: item['payload']['item_idx'],
        keywords: item['payload']['keywords'],
        category: item['payload']['category'],
      }));

      sessionStorage.setItem('Image', preview || '');

      sessionStorage.setItem(
        'SuggestedOutfit',
        JSON.stringify(recommended_outfit),
      );
      sessionStorage.setItem('SimilarItems', JSON.stringify(similarItems));
      sessionStorage.setItem('CurrentSimilarItemIndex', '0');
      sessionStorage.setItem('Count', similarItems.length.toString());
      navigate('/recommendedOutfit');
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsLoading(false);
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
          <div className='relative flex items-center justify-center overflow-hidden rounded border bg-white shadow-md'>
            <img
              src={preview}
              alt='Preview'
              className='max-h-[300px] max-w-[400px] object-contain'
            />
            {isLoading && (
              <div className='absolute inset-0 z-10 flex items-center justify-center bg-white/70'>
                <LoadingIndicator />
              </div>
            )}
          </div>
          <div className='mt-6 flex justify-center gap-6 p-6'>
            <Button text='Subir' onClick={handleClick} />
            <Button text='Eliminar' onClick={handleRemove} />
          </div>
        </>
      )}
    </div>
  );
}
