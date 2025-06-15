import React, { useEffect, useState } from 'react';
import ItemDTO from '../types/ItemDTO';
import Button from './ui/Button';
import ModalTrendo from './ModalTrendo';
import TrendoDTO from '../types/TrendoDTO';
interface ItemCardProps {
  item: ItemDTO;
}

export default function ItemCard({ item }: ItemCardProps) {
  const imageUrl = `http://localhost:8000/get_image/${item.outfit_id}/${item.item_idx}`;

  const [itemImage, setItemImage] = useState<File | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [data, setData] = useState<TrendoDTO[]>([]);

  useEffect(() => {
    const fetchImage = async () => {
      const res = await fetch(imageUrl, {
        method: 'GET',
        cache: 'no-cache',
      });
      const blob = await res.blob();
      setItemImage(new File([blob], 'item.jpg'));
    };
    fetchImage();
  }, [imageUrl]);

  async function handleWhereToBuy() {
    if (!itemImage) {
      console.error('No image available to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', itemImage);
    formData.append('category', item.category);

    const res = await fetch('http://localhost:8000/scrap', {
      method: 'POST',
      body: formData,
    });
    const json = await res.json();
    setData(Array.isArray(json.results) ? json.results : []);
    setModalOpen(true);
  }

  return (
    <>
      <div className='group h-[420px] w-72 transform overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl'>
        <div className='relative h-64 w-full overflow-hidden'>
          <img
            src={imageUrl}
            alt={item.keywords}
            className='h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-110'
          />
          <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
        </div>
        <div className='flex h-[156px] flex-col justify-between p-5'>
          <div>
            <h3 className='mb-2 text-lg font-semibold text-gray-800'>
              {item.category}
            </h3>
            <p className='mb-3 line-clamp-2 text-sm text-gray-600'>
              {item.keywords}
            </p>
          </div>
          <Button text='Donde comprar' onClick={handleWhereToBuy} />
        </div>
      </div>
      <ModalTrendo
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title='Resultados de Trendo'
      >
        {data && (
          <div className='grid grid-cols-2 gap-6'>
            {data.map((trendo, index) => (
              <div
                key={index}
                className='mb-4 flex flex-col items-center rounded-lg border bg-white p-3 shadow-sm'
              >
                <div className='grid grid-cols-2'>
                  <img
                    src={trendo.image_url}
                    alt={trendo.image_alt}
                    className='mb-2 h-28 w-28 rounded border object-cover'
                  />
                  <div className='w-full flex-1 text-center'>
                    <a
                      href={trendo.link}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='block text-base font-semibold hover:text-blue-700'
                    >
                      {trendo.title}
                    </a>
                    <div className='text-sm text-gray-600'>{trendo.brand}</div>
                    <div className='text-sm font-bold text-green-600'>
                      {trendo.price}
                    </div>
                    {trendo.price_old && (
                      <div className='text-xs text-gray-400 line-through'>
                        {trendo.price_old}
                      </div>
                    )}
                    {trendo.discount && (
                      <div className='text-xs font-semibold text-red-500'>
                        {trendo.discount}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ModalTrendo>
    </>
  );
}
