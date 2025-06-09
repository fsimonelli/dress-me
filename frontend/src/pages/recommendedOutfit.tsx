import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Header from '../components/ui/Header';
import ItemCard  from '../components/ui/ItemCard';
import { useEffect, useState } from 'react';
import ItemDTO from '../types/ItemDTO';

export default function ImageHolder() {
  const [items, setItems] = useState<ItemDTO[]>([]);

  useEffect(() => {
    const storedItems = localStorage.getItem('SimilarItems');
    if (storedItems) {
      try {
        const parsedItems: ItemDTO[] = JSON.parse(storedItems);
        setItems(parsedItems);
      } catch (err) {
        console.error('Error parsing SimilarItems:', err);
      }
    }
  }, []);

  return (
    <>
      <Header />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-5 justify-items-center">
        {items.map((item, index) => (
          <div key={index}>
            <ItemCard item={item} />
            {index === 2 && <div className="col-span-full" />} {/* Salto de fila */}
          </div>
        ))}
      </div>
    </>
  );
}