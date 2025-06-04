import { Link } from 'react-router-dom';
import ImageUploader from '../components/ImageUploader';
import Button from '../components/ui/Button';
import Header from '../components/ui/Header';

export default function Home() {
  return (
    <div>
      <Header />
      <ImageUploader />
    </div>
  );
}
