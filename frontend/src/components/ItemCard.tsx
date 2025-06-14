import React, { useEffect, useState } from 'react';
import ItemDTO from '../types/ItemDTO';
import Button from './ui/Button';

interface ItemCardProps {
  item: ItemDTO;
}

export default function ItemCard({ item }: ItemCardProps) {
  const imageUrl = `http://localhost:8000/get_image/${item.outfit_id}/${item.item_idx}`;

  const [itemImage, setItemImage] = useState<File | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      const res = await fetch(imageUrl, {
        method: 'GET',
        headers: {
          Accept: 'image/jpeg',
        },
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

    const data = await res.json();
    console.log(data);
  }

  return (
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
          <p className='line-clamp-2 text-sm text-gray-600'>{item.keywords}</p>
        </div>
        <Button text='Donde comprar' onClick={handleWhereToBuy} />
      </div>
    </div>
  );
}
