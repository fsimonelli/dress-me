import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from 'react-router-dom';
import './index.css';
import Home from './pages/home.tsx';
import RecommendedOutfit from './pages/recommendedOutfit.tsx';
import './index.css';

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path='/home' element={<Home />} />
      <Route path='/recommendedOutfit' element={<RecommendedOutfit />} />
    </>,
  ),
);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
