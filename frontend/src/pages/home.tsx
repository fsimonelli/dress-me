import ImageUploader from '../components/ImageUploader';
import Header from '../components/ui/Header';
import {useState} from 'react';

export default function Home() {

  const [isLoading, setIsLoading] = useState(false);
  return (
    <div>
      <Header />
      <ImageUploader />
    </div>
  );
}
