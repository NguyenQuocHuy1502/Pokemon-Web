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

    // Improved Pokemon image fetching with multiple fallback strategies
    const fetchPokemonImage = async (pokemonName) => {
        const imageUrls = [
            `https://pokeapi.co/api/v2/pokemon/${pokemonName}`,
            `https://pokeapi.co/api/v2/pokemon/${pokemonName}-normal`, // For Deoxys normal form
            `https://pokeapi.co/api/v2/pokemon/${pokemonName}-attack`, // For Deoxys attack form
            `https://pokeapi.co/api/v2/pokemon/${pokemonName}-defense`, // For Deoxys defense form
            `https://pokeapi.co/api/v2/pokemon/${pokemonName}-speed`, // For Deoxys speed form
        ];

        // Special handling for known problematic Pokemon
        const specialCases = {
            'deoxys': 'https://pokeapi.co/api/v2/pokemon/deoxys-normal',
            'deoxys-attack': 'https://pokeapi.co/api/v2/pokemon/deoxys-attack',
            'deoxys-defense': 'https://pokeapi.co/api/v2/pokemon/deoxys-defense',
            'deoxys-speed': 'https://pokeapi.co/api/v2/pokemon/deoxys-speed',
            'giratina': 'https://pokeapi.co/api/v2/pokemon/giratina-altered',
            'giratina-origin': 'https://pokeapi.co/api/v2/pokemon/giratina-origin',
            'shaymin': 'https://pokeapi.co/api/v2/pokemon/shaymin-land',
            'shaymin-sky': 'https://pokeapi.co/api/v2/pokemon/shaymin-sky',
            'basculin': 'https://pokeapi.co/api/v2/pokemon/basculin-red-striped',
            'darmanitan': 'https://pokeapi.co/api/v2/pokemon/darmanitan-standard',
            'tornadus': 'https://pokeapi.co/api/v2/pokemon/tornadus-incarnate',
            'thundurus': 'https://pokeapi.co/api/v2/pokemon/thundurus-incarnate',
            'landorus': 'https://pokeapi.co/api/v2/pokemon/landorus-incarnate',
        };

        // Check if this is a special case first
        if (specialCases[pokemonName]) {
            imageUrls.unshift(specialCases[pokemonName]);
        }

        for (const url of imageUrls) {
            try {
                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    const artwork = data.sprites?.other?.['official-artwork']?.front_default ||
                                  data.sprites?.front_default ||
                                  data.sprites?.other?.home?.front_default;
                    
                    if (artwork) {
                        setPokemonImage(artwork);
                        return;
                    }
                }
            } catch (error) {
                console.log(`Failed to fetch from ${url}:`, error.message);
                continue;
            }
        }

        // If all API calls fail, try using PokemonDB as a fallback
        const pokemonDbUrl = `https://img.pokemondb.net/artwork/${pokemonName}.jpg`;
        setPokemonImage(pokemonDbUrl);
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

                // Fetch the image from the external API with multiple fallback strategies
                await fetchPokemonImage(pokemonName.toLowerCase());

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
    if (!pokemonData) return <div className="no-data-state">No data found.</div>;

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
                Back 
            </button>
            <div className="page-content-wrapper">
                <div className="left-panel">
                    <h2 className="pokemon-number">#{pokemonData.pokemon_id}</h2>
                    <div className="pokemon-picture-container">
                        {pokemonImage ? (
                            <img 
                                src={pokemonImage} 
                                alt={pokemonData.pokemon_name} 
                                className="pokemon-picture"
                                onError={(e) => {
                                    // Final fallback - show a placeholder
                                    e.target.src = 'https://via.placeholder.com/300x300/2c3e50/ecf0f1?text=POKEMON';
                                }}
                            />
                        ) : (
                            <div className="pokemon-placeholder">
                                <div className="placeholder-text">POKEMON</div>
                                <div className="placeholder-id">#{pokemonData.pokemon_id}</div>
                            </div>
                        )}
                    </div>
                    <h1 className="pokemon-name-left">{pokemonData.pokemon_name.toUpperCase()}</h1>
                    
                    {/* Pokemon Type Images */}
                    <div className="pokemon-types-under-name">
                        {getTypes().map((type, index) => (
                            <div key={index} className={`type-badge ${type.toLowerCase()}`}>
                                <span className="type-text-badge">{type}</span>
                            </div>
                        ))}
                    </div>
                    
                    <div className="nav-buttons">
                        {prevPokemon && (
                            <a href={`/pokemon/${prevPokemon.pokemon_name.toLowerCase()}`} className="nav-button nav-button--prev">
                                 {prevPokemon.pokemon_name.toUpperCase()}
                            </a>
                        )}
                        {nextPokemon && (
                            <a href={`/pokemon/${nextPokemon.pokemon_name.toLowerCase()}`} className="nav-button nav-button--next">
                                {nextPokemon.pokemon_name.toUpperCase()}
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
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PokemonPage;
