interface ButtonProps {
  text: string;
  onClick?: () => void;
  className?: string;
}

export default function Button({ text, onClick, className = '' }: ButtonProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={`rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 focus:ring-2 focus:ring-gray-300 focus:outline-none ${className}`}
    >
      {text}
    </button>
  );
}
