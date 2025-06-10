import { Link } from 'react-router-dom';
import '../../index.css';

export default function Header() {
  return (
    <h1 className='header'>
      <Link to='/' className='no-style-link'>
        Dress Me
      </Link>
    </h1>
  );
}
