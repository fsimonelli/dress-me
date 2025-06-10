import Button from '../components/ui/Button';
import Header from '../components/ui/Header';
import ItemCard from '../components/ItemCard';
import { useEffect, useState } from 'react';
import ItemDTO from '../types/ItemDTO';

export default function ImageHolder() {
  const [items, setItems] = useState<ItemDTO[]>([]);

  useEffect(() => {
    const storedItems = localStorage.getItem('SuggestedOutfit');
    if (storedItems) {
      try {
        const parsedItems: ItemDTO[] = JSON.parse(storedItems);
        setItems(parsedItems);
      } catch (err) {
        console.error('Error parsing SimilarItems:', err);
      }
    }
  }, []);

  async function handleNextSuggestion() {
    const numberOfItems = Number(localStorage.getItem('Count'));
    let currentIndex = Number(localStorage.getItem('CurrentSimilarItemIndex'));

    if (currentIndex >= numberOfItems - 1) {
      localStorage.setItem('CurrentSimilarItemIndex', '0');
      currentIndex = 0;
    } else {
      currentIndex++;
      localStorage.setItem('CurrentSimilarItemIndex', currentIndex.toString());
    }
    const similarItems = localStorage.getItem('SimilarItems');
    const newItem: ItemDTO = similarItems
      ? JSON.parse(similarItems)[currentIndex]
      : undefined;
    try {
      const res = await fetch(
        `http://localhost:8000/getRecommendation/${newItem.outfit_id}/${newItem.item_idx}`,
        {
          method: 'GET',
        },
      );

      const response = await res.json();

      localStorage.setItem('SuggestedOutfit', JSON.stringify(response));
      setItems(response);
    } catch (error) {
      console.error('Error fetching next suggestion:', error);
    }
  }

  return (
    <>
      <Header />
      <div className='flex flex-col items-center'>
        <Button
          text='Next suggestion'
          className='m-8'
          onClick={handleNextSuggestion}
        />
        <img
          src={localStorage.getItem('Image') || ''}
          alt='Uploaded'
          className='h-96 w-72 rounded-lg border-2 border-gray-400 shadow-md'
        />
      </div>
      <div className='grid grid-cols-3 justify-items-center gap-6 p-5'>
        {items.map((item, index) => (
          <div key={index}>
            <ItemCard item={item} />
          </div>
        ))}
      </div>
    </>
  );
}
