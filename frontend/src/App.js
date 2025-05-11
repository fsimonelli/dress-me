import logo from './logo.svg';
import './App.css';
import Header  from './components/header';
import ImageUploader from './components/image_uploader';

function App() {
  return (
  <div>
    <div>
      <Header/>
    </div>
    <div className="flex items-center justify-center min-h-screen">
      <ImageUploader/>
    </div>
  </div>
  );
}

export default App;
