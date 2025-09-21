import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useBodyClass from '../hooks/useBodyClass';
import '../css/PokemonPage.css';

// This is done by adding more details about the pokemons and making a better view for the user

function PokemonPage() {
    useBodyClass('pokemon-page-bg');

    const navigate = useNavigate();
    const { pokemonName } = useParams();
    const [pokemonData, setPokemonData] = useState(null);
    const [pokemonImage, setPokemonImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [allPokemon, setAllPokemon] = useState([]);
    const [prevPokemon, setPrevPokemon] = useState(null);
    const [nextPokemon, setNextPokemon] = useState(null);
    const handleBackClick = () => {
        navigate('/');
    };
    useEffect(() => {
        const fetchAllPokemon = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/api/all_pokemon');
                const data = await response.json();
                setAllPokemon(data);
            } catch (err) {
                console.error('Failed to fetch all pokemon data:', err);
            }
        };

        fetchAllPokemon();
    }, []);

    useEffect(() => {
        if (allPokemon.length > 0) {
            const currentPokemonIndex = allPokemon.findIndex(p => p.pokemon_name.toLowerCase() === pokemonName.toLowerCase());
            if (currentPokemonIndex !== -1) {
                const previous = allPokemon[currentPokemonIndex - 1] || null;
                const next = allPokemon[currentPokemonIndex + 1] || null;
                setPrevPokemon(previous);
                setNextPokemon(next);
            }
        }
    }, [pokemonName, allPokemon]);

    useEffect(() => {
        const fetchAllData = async () => {
            if (!pokemonName) return;

            setLoading(true);
            setError(null);
            setPokemonData(null);
            setPokemonImage(null);

            try {
                // Now that the database has lowercase names, we should use a lowercase name for the fetch request.
                const localRes = await fetch(`http://127.0.0.1:5000/api/pokemon/${pokemonName.toLowerCase()}`);
                if (!localRes.ok) {
                    throw new Error('Pokemon not found in your database!');
                }
                const localData = await localRes.json();
                setPokemonData(localData);

                // Fetch the image from the external API, which expects lowercase names
                const imageRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`);
                if (!imageRes.ok) {
                    throw new Error('Image not found!');
                }
                const imageData = await imageRes.json();
                const officialArtwork = imageData.sprites.other['official-artwork'].front_default;
                setPokemonImage(officialArtwork);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, [pokemonName]);

    // Use the custom hook to manage the body class
    useBodyClass('pokemon-page-bg');

    if (loading) return <div className="loading-state">Loading...</div>;
    if (error) return <div className="error-state">Error: {error}</div>;
    if (!pokemonData || !pokemonImage) return <div className="no-data-state">No data found.</div>;
    
    // Helper functions to parse string data
    const getTypes = () => {
        if (!pokemonData.type) return [];
        return pokemonData.type.replace(/[['"\]]/g, '').split(',').map(s => s.trim()).filter(s => s);
    };

    const getChargedMoves = () => {
        if (!pokemonData.charged_moves) return [];
        return pokemonData.charged_moves.replace(/[['"\]]/g, '').split(',').map(s => s.trim()).filter(s => s);
    };

    const getFastMoves = () => {
        if (!pokemonData.fast_moves) return [];
        return pokemonData.fast_moves.replace(/[['"\]]/g, '').split(',').map(s => s.trim()).filter(s => s);
    };
    
    // Render the component
    return (
        <div className="pokemon-page-container">
            <button onClick={handleBackClick} className="back-button">
                &lt; Back to Search
            </button>
            <div className="page-content-wrapper">
                <div className="left-panel">
                    <h2 className="pokemon-number">#{pokemonData.pokemon_id}</h2>
                    <div className="pokemon-picture-container">
                        <img src={pokemonImage} alt={pokemonData.pokemon_name} className="pokemon-picture" />
                    </div>
                    <h1 className="pokemon-name-left">{pokemonData.pokemon_name.toUpperCase()}</h1>
                    <div className="flex justify-center items-center mt-8 space-x-4">
                        {prevPokemon && (
                            <a href={`/pokemon/${prevPokemon.pokemon_name.toLowerCase()}`} className="px-4 py-2 bg-gray-700 text-white font-semibold rounded-full hover:bg-gray-600 transition-colors">
                                &lt; {prevPokemon.pokemon_name}
                            </a>
                        )}
                        {nextPokemon && (
                            <a href={`/pokemon/${nextPokemon.pokemon_name.toLowerCase()}`} className="px-4 py-2 bg-gray-700 text-white font-semibold rounded-full hover:bg-gray-600 transition-colors">
                                {nextPokemon.pokemon_name} &gt;
                            </a>
                        )}
                    </div>
                </div>
                <div className="right-panel">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="info-box">
                            <h3 className="info-title">Stats</h3>
                            <p className="info-text">Attack: {pokemonData.base_attack}</p>
                            <p className="info-text">Defense: {pokemonData.base_defense}</p>
                            <p className="info-text">Stamina: {pokemonData.base_stamina}</p>
                        </div>
                        
                        <div className="info-box">
                            <h3 className="info-title">Moves</h3>
                            <div className="flex flex-col space-y-4">
                                <div>
                                    <h4 className="move-type-title">Fast Moves</h4>
                                    <div className="moves-list">
                                        {getFastMoves().map((move, index) => (
                                            <span key={index} className="move-item">{move}</span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="move-type-title">Charged Moves</h4>
                                    <div className="moves-list">
                                        {getChargedMoves().map((move, index) => (
                                            <span key={index} className="move-item">{move}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="info-box">
                            <h3 className="info-title">General Info</h3>
                            <p className="info-text">Rarity: {pokemonData.rarity}</p>
                            <p className="info-text">Candy Required: {pokemonData.candy_required || 'N/A'}</p>
                            <p className="info-text">Walk Distance: {pokemonData.distance} km</p>
                            <p className="info-text">Max CP: {pokemonData.max_cp}</p>
                        </div>
                        
                        <div className="info-box">
                            <h3 className="info-title">Type</h3>
                            <div className="type-icons">
                                {getTypes().map((type, index) => (
                                    <span key={index} className="type-text">{type}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PokemonPage;
