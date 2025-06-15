import React from 'react';
import { useEffect } from 'react';
import Button from './ui/Button';
interface ModalTrendoProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export default function ModalTrendo({
  isOpen,
  onClose,
  children,
  title,
}: ModalTrendoProps) {
  if (!isOpen) return null;
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);
  return (
    <div
      className='modal-dialog fixed inset-0 z-50 flex h-screen w-full items-center justify-center overflow-x-hidden overflow-y-auto bg-white/10 backdrop-blur-sm'
      aria-modal='true'
      role='dialog'
      tabIndex={-1}
    >
      <div className='modal-body relative mx-4 max-h-full w-full max-w-2xl p-4'>
        <div className='animate-modal-fade-in relative rounded-lg bg-white shadow-sm transition-transform duration-200 ease-out'>
          {/* Modal header */}
          <div className='flex items-center justify-between rounded-t border-b border-gray-200 p-4 md:p-5'>
            <h3 className='text-lg font-semibold text-gray-900'>
              {title || 'Resultados'}
            </h3>
            <Button
              text={
                <svg
                  className='h-3 w-3'
                  aria-hidden='true'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 14 14'
                >
                  <path
                    stroke='currentColor'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6'
                  />
                </svg>
              }
              onClick={onClose}
            />
          </div>
          {/* Modal body */}
          <div className='scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 max-h-[69vh] overflow-y-auto p-4 md:p-5'>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
