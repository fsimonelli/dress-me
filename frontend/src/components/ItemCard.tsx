import React from 'react';
import ItemDTO from '../types/ItemDTO';

interface ItemCardProps {
  item: ItemDTO;
}

const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  return (
    <div className='h-96 w-72 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm'>
      <a href='#'>
        <img
          src={`http://127.0.0.1:8000/get_image/${item.outfit_id}/${item.item_idx}`}
          alt={item.keywords}
          className='h-64 w-full rounded-t-lg bg-white object-contain p-2'
        />
      </a>
      <div className='p-5'>
        <p className='mb-3 font-normal text-gray-700 dark:text-gray-400'>
          {item.category}
        </p>
        <a
          href='https://reemans.github.io/heartstopper/'
          className='inline-flex items-center rounded-lg bg-blue-700 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none'
        >
          Donde comprar
          <svg
            className='ms-2 h-3.5 w-3.5 rtl:rotate-180'
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
