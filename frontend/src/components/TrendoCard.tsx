import React from 'react';
import TrendoDTO from '../types/TrendoDTO';

interface TrendoCardProps {
  index: number;
  trendo: TrendoDTO;
}

export default function TrendoCard({ index, trendo }: TrendoCardProps) {
  return (
    <a
      href={trendo.link}
      target='_blank'
      rel='noopener noreferrer'
      className='block transition-transform hover:scale-105'
    >
      <div
        key={index}
        className='mb-4 flex flex-col items-center rounded-lg bg-white p-3 shadow-2xl'
      >
        <div className='grid grid-cols-2'>
          <img
            src={trendo.image_url}
            alt={trendo.image_alt}
            className='h-40 w-40 rounded object-cover p-2'
          />
          <div className='flex h-full w-full flex-col justify-center text-center'>
            <div className='block text-base font-bold text-black hover:text-black'>
              {trendo.title}
            </div>
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
    </a>
  );
}
