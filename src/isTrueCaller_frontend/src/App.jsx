import { Route, Routes } from 'react-router-dom';
import Detect from './components/Detect';
import LandingPage from './components/LandingPage';
function App() {
  

  return (
    <Routes>
      <Route path="/" element={<LandingPage/>} />
      <Route path="/detect" element={<Detect/>} />
    </Routes>
  );
}

export default App;