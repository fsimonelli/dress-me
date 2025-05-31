interface ButtonProps {
  text: string;
  onClick?: () => void;
}

export default function Button(props: ButtonProps) {
  return (
    <button
      type='button'
      className='me-2 mb-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 focus:outline-none'
      onClick={props.onClick}
    >
      {props.text}
    </button>
  );
}
