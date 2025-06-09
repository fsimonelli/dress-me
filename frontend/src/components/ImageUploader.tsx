import { useState, useRef } from 'react';
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
  } 

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

      const recommended_outfit: ItemDTO[] = response[0].map((qdrantItem) => { // Esto no seria el suggested item?
        const outfit_id = qdrantItem['outfit_id'];
        const item_idx = qdrantItem['item_idx'];

        return {
          outfit_id,
          item_idx,
          keywords: qdrantItem['keywords'],
          category: qdrantItem['category'],
          imageUrl: `http://127.0.0.1:8000/get_image/${outfit_id}/${item_idx}`,
        };
      });

      const suggestedOutfit: ItemDTO[] = response[0].map((item: any) => ({ // Aca deberia modificarlo para poder obtener este pero no tengo idea como hacerlo T_T
        ...item,
        imageUrl: `http://127.0.0.1:8000/getRecommendation/${item.outfit_id}/${item.item_idx}`,
      }));

      console.log('Suggested Outfit:', suggestedOutfit);
      console.log('Similar Items:', recommended_outfit); 
      localStorage.setItem('SimilarItems', JSON.stringify(recommended_outfit));
      localStorage.setItem('SuggestedOutfit', JSON.stringify(suggestedOutfit));
/*linea 83 y 84 carecen de coherencia para mi irian en ambas similar items porque lo del qdrant item antes era esto, pero lo cambiamos a que acceda a la pos 0 del arreglo para que de
 de bien, aunque para mi habria que ajustarlo para que lo acceda desde el suggestedOutfit cosa que probe pero no pude, todo esto si queres que quede lindo y funcional, ahora 
 esta funcional nomas*/
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
          <div className="relative rounded border overflow-hidden shadow-md bg-white flex items-center justify-center">
            <img
              src={preview}
              alt="Preview"
              className="object-contain max-w-[400px] max-h-[300px]"
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
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
