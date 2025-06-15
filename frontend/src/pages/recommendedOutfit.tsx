import React from 'react';
import Button from '../components/ui/Button';
import Header from '../components/ui/Header';
import ItemCard from '../components/ItemCard';
import { useEffect, useState } from 'react';
import ItemDTO from '../types/ItemDTO';
import PointDTO from '../types/PointDTO';

export default function RecommendedOutfit() {
  const [items, setItems] = useState<ItemDTO[]>([]);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentSimilarItem, setCurrentSimilarItem] = useState<ItemDTO | null>(
    null,
  );

  useEffect(() => {
    const storedItems = sessionStorage.getItem('SuggestedOutfit');
    const similarItems = sessionStorage.getItem('SimilarItems');
    const storedIndex =
      Number(sessionStorage.getItem('CurrentSimilarItemIndex')) || 0;

    if (similarItems) {
      const parsedSimilarItems: PointDTO[] = JSON.parse(similarItems);
      setCurrentScore(parsedSimilarItems[storedIndex]?.score || 0);
      setCurrentIndex(storedIndex);
      setCurrentSimilarItem(parsedSimilarItems[storedIndex]?.payload);
    }

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
    let nextIndex = currentIndex >= numberOfItems - 1 ? 0 : currentIndex + 1;

    sessionStorage.setItem('CurrentSimilarItemIndex', nextIndex.toString());
    setCurrentIndex(nextIndex);

    const similarItems = sessionStorage.getItem('SimilarItems');
    if (!similarItems) return;

    const parsedSimilarItems: PointDTO[] = JSON.parse(similarItems);
    const newItem = parsedSimilarItems[nextIndex];

    if (newItem?.payload) {
      setCurrentScore(newItem.score);
      setCurrentSimilarItem(newItem.payload);

      try {
        const res = await fetch(
          `http://localhost:8000/getRecommendation/${newItem.payload.outfit_id}/${newItem.payload.item_idx}`,
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
        <div className='mb-4 flex flex-row items-center gap-8 rounded-lg bg-white p-4 shadow-sm'>
          <ItemCard isUploaded={true} />
          <div className='flex flex-col items-center'>
            <p className='mb-2 text-4xl text-gray-400'>≈</p>
            <p className='rounded-lg bg-white px-4 py-2 text-lg font-semibold shadow-sm'>
              Puntuación:{' '}
              <span className='text-blue-600'>
                {Math.round(currentScore * 100)}%
              </span>
            </p>
          </div>
          {currentSimilarItem && (
            <ItemCard item={currentSimilarItem} isUploaded={false} />
          )}
        </div>
      </div>
      <div className='grid grid-cols-4 justify-items-center gap-6 p-5'>
        {items.map((item, index) => (
          <div key={index}>
            <ItemCard item={item} isUploaded={false} />
          </div>
        ))}
      </div>
    </>
  );
}
