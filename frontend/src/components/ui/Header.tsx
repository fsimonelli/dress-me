import React from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className='header'>
      <div className='header-content'>
        <h1 className='w-full text-center'>
          <Link to='/' className='no-style-link'>
            Dress Me
          </Link>
        </h1>
      </div>
    </header>
  );
}
