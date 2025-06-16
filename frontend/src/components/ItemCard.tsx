import React, { useEffect, useState } from 'react';
import ItemDTO from '../types/ItemDTO';
import Button from './ui/Button';
import ModalTrendo from './ModalTrendo';
import TrendoDTO from '../types/TrendoDTO';
import { ClipLoader } from 'react-spinners';
import TrendoCard from './TrendoCard';

interface ItemCardProps {
  isUploaded: boolean;
  item?: ItemDTO;
}

export default function ItemCard({ item, isUploaded }: ItemCardProps) {
  const imageUrl = `http://localhost:8000/get_image/${item?.outfit_id}/${item?.item_idx}`;

  const [itemImage, setItemImage] = useState<File | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [data, setData] = useState<TrendoDTO[]>([]);
  const [generatedTerms, setGeneratedTerms] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isUploaded) {
      const fetchImage = async () => {
        const res = await fetch(imageUrl, {
          method: 'GET',
          cache: 'no-cache',
        });
        const blob = await res.blob();
        setItemImage(new File([blob], 'item.jpg'));
      };
      fetchImage();
    }
  }, [imageUrl, isUploaded]);

  function handleModalClose() {
    setModalOpen(false);
    setData([]);
    setGeneratedTerms('');
  }

  async function handleWhereToBuy() {
    if (!itemImage && !isUploaded) {
      console.error('No image available to upload');
      return;
    }
    setModalOpen(true);
    const formData = new FormData();
    if (!isUploaded) {
      formData.append('file', itemImage!);
      formData.append('category', item!.category);
    } else {
      const base64Image = sessionStorage.getItem('Image') || '';
      const imageBlob = await fetch(base64Image).then((r) => r.blob());
      const imageFile = new File([imageBlob], 'uploaded-item.jpg', {
        type: 'image/jpeg',
      });
      formData.append('file', imageFile);
      formData.append('category', '');
    }

    setIsLoading(true);
    const res = await fetch('http://localhost:8000/scrap', {
      method: 'POST',
      body: formData,
    });
    const json = await res.json();

    setData(Array.isArray(json[0].results) ? json[0].results : []);
    setGeneratedTerms(json[1]);
    setIsLoading(false);
  }

  return (
    <>
      <div className='group h-[420px] w-72 transform overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl'>
        <div className='relative h-64 w-full overflow-hidden'>
          <img
            src={!isUploaded ? imageUrl : sessionStorage.getItem('Image') || ''}
            className='h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-110'
          />
          <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
        </div>
        <div className='flex h-[156px] flex-col justify-between p-5'>
          <div>
            <h3 className='text-lg font-semibold text-gray-800'>
              {!isUploaded ? item!.category : 'Tu prenda'}
            </h3>
            {!isUploaded && (
              <p className='mb-3 line-clamp-2 text-sm text-gray-600'>
                {item!.keywords}
              </p>
            )}
          </div>
          <Button text='Donde comprar' onClick={handleWhereToBuy} />
        </div>
      </div>
      <ModalTrendo
        isOpen={modalOpen}
        onClose={handleModalClose}
        title='Resultados de Trendo'
      >
        {isLoading ? (
          <div className='flex h-full items-center justify-center'>
            <ClipLoader color='#000000' size={50} />
          </div>
        ) : (
          <>
            <h3 className='mb-6 text-center font-bold text-gray-700'>
              Términos de búsqueda:{' '}
              <span className='bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent italic'>
                {generatedTerms}
              </span>
            </h3>
            <div className='grid grid-cols-2 gap-6'>
              {data.map((trendo, index) => (
                <TrendoCard index={index} trendo={trendo} />
              ))}
            </div>
          </>
        )}
      </ModalTrendo>
    </>
  );
}
