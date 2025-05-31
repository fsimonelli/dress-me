import { Link } from 'react-router-dom';
import ImageUploader from '../components/ImageUploader';
import Button from '../components/ui/Button';

export default function Home() {
  return (
    <div>
      <h1 className='mb-4 text-2xl font-bold'>Dress Me</h1>
      <ImageUploader />
    </div>
  );
}
