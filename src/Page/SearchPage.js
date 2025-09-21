import '../css/SearchPage.css';
import React, { useState } from 'react';
import pokeball from '../assets/image/Poke_Ball.webp';
import { Routes, Route, useNavigate } from 'react-router-dom';

function SearchPage() {
  const [region, setRegion] = useState('');
  const [pokemon, setPokemon] = useState('');
  const navigate = useNavigate();

  const handleSearch = (event) => {
    event.preventDefault();
    if (pokemon) {
      navigate(`/pokemon/${pokemon}`); // Navigate to the new page with the pokemon name in the URL
    }
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
      <form className="card__form" onSubmit={handleSearch}>
        <div className="form-group">
          <label htmlFor="region" className="form-label">Region</label>
          <input
            type="text"
            id="region"
            className="form-input"
            placeholder="e.g., Kanto"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="pokemon" className="form-label">Pokemon</label>
          <input
            type="text"
            id="pokemon"
            className="form-input"
            placeholder="e.g., Pikachu"
            value={pokemon}
            onChange={(e) => setPokemon(e.target.value)}
          />
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