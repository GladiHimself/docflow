import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import FileDetailPage from './pages/FileDetailPage';

function App() {
  return (
    // BrowserRouter enables routing for the entire app
    <BrowserRouter>
      <Navbar />  {/* Navbar shows on ALL pages */}
      <Routes>
        {/* Route maps URL path to component */}
        <Route path="/" element={<HomePage />} />
        <Route path="/file/:id" element={<FileDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;