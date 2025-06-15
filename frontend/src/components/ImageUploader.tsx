import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ItemDTO from '../types/ItemDTO';
import Button from './ui/Button';
import { ClipLoader } from 'react-spinners';

export default function ImageUploader() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.type.startsWith('image/')) {
        setFile(droppedFile);
        setPreview(URL.createObjectURL(droppedFile));
      } else {
        setError('Por favor, sube una imagen válida');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type.startsWith('image/')) {
        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
      } else {
        setError('Por favor, sube una imagen válida');
      }
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
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

      if (!res.ok) {
        throw new Error('Error al subir la imagen');
      }

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
      setError('Error al subir la imagen. Por favor, intenta de nuevo.');
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
            onDragLeave={handleDragLeave}
            className={`flex h-[300px] w-[400px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-300 ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 bg-white hover:border-gray-400'
            }`}
          >
            <svg
              className={`mb-4 h-12 w-12 transition-colors duration-300 ${
                isDragging ? 'text-blue-500' : 'text-gray-400'
              }`}
              aria-hidden='true'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 20 16'
            >
              <path
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2'
              />
            </svg>
            <p
              className={`mb-2 text-sm font-medium transition-colors duration-300 ${
                isDragging ? 'text-blue-500' : 'text-gray-500'
              }`}
            >
              {isDragging ? 'Suelta la imagen aquí' : 'Arrastrá una imagen o'}
            </p>
            <p
              className={`text-xs transition-colors duration-300 ${
                isDragging ? 'text-blue-400' : 'text-gray-400'
              }`}
            >
              PNG, JPG
            </p>
          </div>
          <div className='mt-6'>
            <Button
              text='Seleccionar imagen'
              onClick={handleButtonClick}
              className='bg-blue-600 hover:bg-blue-700'
            />
            <input
              type='file'
              accept='image/*'
              ref={fileInputRef}
              onChange={handleFileSelect}
              className='hidden'
            />
          </div>
        </>
      )}

      {preview && (
        <>
          <div className='relative flex items-center justify-center overflow-hidden rounded-xl border bg-white shadow-lg transition-all duration-300 hover:shadow-xl'>
            <img
              src={preview}
              alt='Preview'
              className='max-h-[400px] max-w-[500px] object-contain p-4'
            />
            {isLoading && (
              <div className='absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm'>
                <ClipLoader color='#000000' size={50} />
              </div>
            )}
          </div>
          <div className='mt-6 flex justify-center gap-6 p-6'>
            <Button text='Subir' onClick={handleClick} />
            <Button text='Eliminar' onClick={handleRemove} />
          </div>
        </>
      )}

      {error && (
        <div className='mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-600'>
          {error}
        </div>
      )}
    </div>
  );
}
