import '../css/SearchPage.css';
import React, { useState, useEffect, useMemo } from 'react';
import pokeball from '../assets/image/Poke_Ball.webp';
import { Routes, Route, useNavigate } from 'react-router-dom';

function SearchPage() {
  const [region, setRegion] = useState('');
  const [pokemon, setPokemon] = useState('');
  const [allPokemon, setAllPokemon] = useState([]);
  const [showPokemonSuggestions, setShowPokemonSuggestions] = useState(false);
  const [showRegionSuggestions, setShowRegionSuggestions] = useState(false);
  const [hasChosen, setHasChosen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllPokemon = async () => {
      try {
        const res = await fetch('http://127.0.0.1:5000/api/all_pokemon');
        const data = await res.json();
        setAllPokemon(data);
      } catch (e) {
        console.error('Failed to load pokemon list', e);
      }
    };
    fetchAllPokemon();
  }, []);

  const regionOptions = useMemo(() => (
    ['Kanto','Johto','Hoenn','Sinnoh','Unova','Kalos','Alola','Galar','Hisui','Paldea']
  ), []);

  const regionRange = useMemo(() => {
    const key = region.trim().toLowerCase();
    const map = {
      'kanto': [1, 151],
      'johto': [152, 251],
      'hoenn': [252, 386],
      'sinnoh': [387, 493],
      'unova': [494, 649],
      'kalos': [650, 721],
      'alola': [722, 809],
      'galar': [810, 898],
      'hisui': [899, 905],
      'paldea': [906, 1010]
    };
    return map[key] || null;
  }, [region]);

  const filteredRegionOptions = useMemo(() => {
    const q = region.trim().toLowerCase();
    if (!q) return regionOptions;
    return regionOptions.filter(r => r.toLowerCase().startsWith(q));
  }, [region, regionOptions]);

  const suggestions = useMemo(() => {
    if (hasChosen) return [];
    const q = pokemon.trim().toLowerCase();
    let list = allPokemon;
    if (regionRange) {
      const [minId, maxId] = regionRange;
      list = list.filter(p => p.pokemon_id >= minId && p.pokemon_id <= maxId);
    }
    const filtered = q
      ? list.filter(p => p.pokemon_name.toLowerCase().startsWith(q))
      : list;
    return filtered.slice(0, 8);
  }, [pokemon, allPokemon, regionRange, hasChosen]);

  const handleSearch = (event) => {
    event.preventDefault();
    if (pokemon) {
      navigate(`/pokemon/${pokemon}`); // Navigate to the new page with the pokemon name in the URL
    }
  };

  const handlePokemonChange = (e) => {
    setPokemon(e.target.value);
    setHasChosen(false);
    setShowPokemonSuggestions(true);
  };

  const handleChoose = (name) => {
    setPokemon(name);
    setHasChosen(true);
    setShowPokemonSuggestions(false);
  };

  const handleRegionChange = (e) => {
    setRegion(e.target.value);
    setShowRegionSuggestions(true);
  };

  const chooseRegion = (name) => {
    setRegion(name);
    setShowRegionSuggestions(false);
  };

  return (
  <div className="layout-container">
    <div className="card">
      <div className="card__header">
        <img
          src={pokeball}
          alt="Pokeball"
          className="pokeball-icon"
        />
      </div>
      <form className="card__form" onSubmit={handleSearch} autoComplete="off">
        <div className="form-group suggestions-wrapper">
          <label htmlFor="region" className="form-label">Region</label>
          <input
            type="text"
            id="region"
            className="form-input"
            placeholder="e.g., Kanto"
            value={region}
            onChange={handleRegionChange}
            onFocus={() => setShowRegionSuggestions(true)}
            onBlur={() => setTimeout(() => setShowRegionSuggestions(false), 120)}
            autoComplete="off"
            name="region-search"
            spellCheck={false}
            autoCorrect="off"
          />
          {showRegionSuggestions && filteredRegionOptions.length > 0 && (
            <ul className="suggestions-list">
              {filteredRegionOptions.map(r => (
                <li key={r}>
                  <button type="button" className="suggestion-item" onClick={() => chooseRegion(r)}>
                    <span className="suggestion-name">{r}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="form-group suggestions-wrapper">
          <label htmlFor="pokemon" className="form-label">Pokemon</label>
          <input
            type="text"
            id="pokemon"
            className="form-input"
            placeholder="e.g., Pikachu"
            value={pokemon}
            onChange={handlePokemonChange}
            onFocus={() => { if (!hasChosen) setShowPokemonSuggestions(true); }}
            onBlur={() => setTimeout(() => setShowPokemonSuggestions(false), 120)}
            autoComplete="off"
            name="pokemon-search"
            spellCheck={false}
            autoCorrect="off"
          />
          {showPokemonSuggestions && suggestions.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.map(s => (
                <li key={s.pokemon_id}>
                  <button type="button" className="suggestion-item" onClick={() => handleChoose(s.pokemon_name)}>
                    <span className="suggestion-id">#{s.pokemon_id}</span>
                    <span className="suggestion-name">{s.pokemon_name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button type="submit" className="form-button">
          Search
        </button>
      </form>

    </div>
  </div>
);
}
export default SearchPage;