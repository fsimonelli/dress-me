import React from 'react';
import ItemDTO from '../types/ItemDTO';

interface ItemCardProps {
  item: ItemDTO;
}

const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  return (
    <div className='group h-[420px] w-72 transform overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl'>
      <div className='relative h-64 w-full overflow-hidden'>
        <img
          src={`http://127.0.0.1:8000/get_image/${item.outfit_id}/${item.item_idx}`}
          alt={item.keywords}
          className='h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-110'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
      </div>
      <div className='flex h-[156px] flex-col justify-between p-5'>
        <div>
          <h3 className='mb-2 text-lg font-semibold text-gray-800'>{item.category}</h3>
          <p className='text-sm text-gray-600 line-clamp-2'>{item.keywords}</p>
        </div>
        <a
          href='https://reemans.github.io/heartstopper/'
          className='inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors duration-300 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300'
        >
          Donde comprar
          <svg
            className='ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1'
            aria-hidden='true'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 14 10'
          >
            <path
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M1 5h12m0 0L9 1m4 4L9 9'
            />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default ItemCard;
