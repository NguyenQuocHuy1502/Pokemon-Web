import { Routes, Route } from 'react-router-dom';
import PokemonPage from './Page/PokemonPage';
import SearchPage from './Page/SearchPage';


function App() {
  return (
    <Routes>
      <Route path="/" element={<SearchPage />} /> 
      <Route path="/pokemon/:pokemonName" element={<PokemonPage />} /> 
    </Routes>
  );
}

export default App;
