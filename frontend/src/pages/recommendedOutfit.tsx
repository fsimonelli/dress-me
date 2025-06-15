import React from 'react';
import Button from '../components/ui/Button';
import Header from '../components/ui/Header';
import ItemCard from '../components/ItemCard';
import { useEffect, useState } from 'react';
import ItemDTO from '../types/ItemDTO';

export default function RecommendedOutfit() {
  const [items, setItems] = useState<ItemDTO[]>([]);

  useEffect(() => {
    const storedItems = sessionStorage.getItem('SuggestedOutfit');
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
    const numberOfItems = Number(sessionStorage.getItem('Count'));
    let currentIndex = Number(
      sessionStorage.getItem('CurrentSimilarItemIndex'),
    );

    if (currentIndex >= numberOfItems - 1) {
      sessionStorage.setItem('CurrentSimilarItemIndex', '0');
      currentIndex = 0;
    } else {
      currentIndex++;
      sessionStorage.setItem(
        'CurrentSimilarItemIndex',
        currentIndex.toString(),
      );
    }
    const similarItems = sessionStorage.getItem('SimilarItems');
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

      sessionStorage.setItem('SuggestedOutfit', JSON.stringify(response));
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
          text='Siguiente sugerencia'
          className='m-8'
          onClick={handleNextSuggestion}
        />
        <ItemCard isUploaded={true} />
      </div>
      <div className='grid grid-cols-3 justify-items-center gap-6 p-5'>
        {items.map((item, index) => (
          <div key={index}>
            <ItemCard item={item} isUploaded={false} />
          </div>
        ))}
      </div>
    </>
  );
}
