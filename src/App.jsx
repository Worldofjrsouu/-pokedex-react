import axios from 'axios'
import { useState, useEffect } from 'react'
import './App.css'

const POKEMON_COUNT = 1350

function App() {
  const [pokemonList, setPokemonList] = useState([])
  const [selectedPokemon, setSelectedPokemon] = useState(null)
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [currentTab, setCurrentTab] = useState('all')

  useEffect(function () {
    getAllPokemon()
  }, [])

  function getAllPokemon() {
    setIsLoading(true)

    axios
      .get('https://pokeapi.co/api/v2/pokemon?limit=' + POKEMON_COUNT)
      .then(function (response) {
        const pokemonUrls = response.data.results.map(function (pokemon) {
          return pokemon.url
        })

        const requests = pokemonUrls.map(function (url) {
          return axios.get(url)
        })

        return Promise.all(requests)
      })
      .then(function (responses) {
        const pokemonData = responses.map(function (response) {
          return response.data
        })

        setPokemonList(pokemonData)
        setIsLoading(false)
      })
      .catch(function (error) {
        console.log(error)
        setIsLoading(false)
      })
  }

  function handleCardClick(pokemon) {
    setSelectedPokemon(pokemon)
    setDescription('')

    axios
      .get('https://pokeapi.co/api/v2/pokemon-species/' + pokemon.id)
      .then(function (response) {
        const entries = response.data.flavor_text_entries
        let englishEntry = null

        for (let i = 0; i < entries.length; i++) {
          if (entries[i].language.name === 'en') {
            englishEntry = entries[i]
            break
          }
        }

        if (englishEntry !== null) {
          const cleanText = englishEntry.flavor_text
            .replace(/\f/g, ' ')
            .replace(/\n/g, ' ')

          setDescription(cleanText)
        } else {
          setDescription('')
        }
      })
      .catch(function (error) {
        console.log(error)
        setDescription('')
      })
  }

  function handleBackClick() {
    setSelectedPokemon(null)
    setDescription('')
  }

  function handleTabClick(tab) {
    setCurrentTab(tab)
    setSelectedPokemon(null)

    if (tab === 'all') {
      setSearchText('')
    }
  }

  function getStatValue(pokemon, statName) {
    for (let i = 0; i < pokemon.stats.length; i++) {
      if (pokemon.stats[i].stat.name === statName) {
        return pokemon.stats[i].base_stat
      }
    }

    return 0
  }

  function getPokemonImage(pokemon) {
    const sprites = pokemon.sprites

    if (
      sprites.other &&
      sprites.other['official-artwork'] &&
      sprites.other['official-artwork'].front_default
    ) {
      return sprites.other['official-artwork'].front_default
    }

    return sprites.front_default
  }

  function getPokemonCardImage(pokemon) {
    const sprites = pokemon.sprites

    if (
      sprites.other &&
      sprites.other.showdown &&
      sprites.other.showdown.front_default
    ) {
      return sprites.other.showdown.front_default
    }

    return getPokemonImage(pokemon)
  }

  const filteredPokemonList = pokemonList.filter(function (pokemon) {
    return pokemon.name.toLowerCase().includes(searchText.toLowerCase())
  })

  let pokemonToShow = pokemonList

  if (currentTab === 'search') {
    pokemonToShow = filteredPokemonList
  }

  return (
    <div className="body">
      <nav className="navbar">
        <div className="nav-brand">
          <span className="pokeball-icon"></span>
          <span className="brand-text">JAYY POKÉDEX</span>
        </div>

        <div className="nav-links">
          <button
            className={currentTab === 'all' ? 'nav-btn active' : 'nav-btn'}
            onClick={function () {
              handleTabClick('all')
            }}
          >
            All Pokémon
          </button>

          <button
            className={currentTab === 'search' ? 'nav-btn active' : 'nav-btn'}
            onClick={function () {
              handleTabClick('search')
            }}
          >
            Search
          </button>
        </div>
      </nav>

      <div className="page-content">
        {currentTab === 'search' && selectedPokemon === null && (
          <div className="search-hero">
            <h2>Seach a Pokémon</h2>

            <div className="search-bar">
              <span className="search-icon">🔍</span>

              <input
                type="text"
                placeholder="Type a Pokémon name..."
                value={searchText}
                onChange={function (event) {
                  setSearchText(event.target.value)
                }}
                autoFocus
              />
            </div>
          </div>
        )}

        {isLoading && <p className="loading-text">Loading Pokémon...</p>}

        {!isLoading &&
          selectedPokemon === null &&
          (currentTab === 'all' || searchText !== '') && (
            <div className="grid">
              {pokemonToShow.map(function (pokemon) {
                return (
                  <div
                    key={pokemon.id}
                    className="poke-card"
                    onClick={function () {
                      handleCardClick(pokemon)
                    }}
                  >
                    <span className="card-id">
                      #{String(pokemon.id).padStart(3, '0')}
                    </span>

                    <img
                      src={getPokemonCardImage(pokemon)}
                      alt={pokemon.name}
                    />

                    <h3>{pokemon.name}</h3>

                    <div className="type-badges">
                      {pokemon.types.map(function (typeInfo) {
                        const typeName = typeInfo.type.name

                        return (
                          <span
                            key={typeName}
                            className={'type-badge type-' + typeName}
                          >
                            {typeName}
                          </span>
                        )
                      })}
                    </div>

                    <div className="card-divider"></div>

                    <p className="card-label">ABILITIES</p>

                    <div className="ability-badges">
                      {pokemon.abilities
                        .slice(0, 2)
                        .map(function (abilityInfo) {
                          const abilityName = abilityInfo.ability.name

                          return (
                            <span key={abilityName} className="ability-badge">
                              {abilityName}
                            </span>
                          )
                        })}
                    </div>

                    <p className="card-label">MOVES</p>

                    <div className="move-badges">
                      {pokemon.moves.slice(0, 3).map(function (moveInfo) {
                        const moveName = moveInfo.move.name

                        return (
                          <span key={moveName} className="move-badge">
                            {moveName}
                          </span>
                        )
                      })}
                    </div>

                    <div className="card-footer">
                      <span>HP {getStatValue(pokemon, 'hp')}</span>
                      <span>ATK {getStatValue(pokemon, 'attack')}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

        {currentTab === 'search' &&
          searchText === '' &&
          selectedPokemon === null && (
            <p className="hint-text">Start typing above for results</p>
          )}

        {selectedPokemon !== null && (
          <div className="detail-view">
            <button className="back-button" onClick={handleBackClick}>
              ← ALL POKÉMON
            </button>

            <div className="detail-content">
              <div className="detail-left">
                <div className="detail-image-box">
                  <img
                    src={getPokemonImage(selectedPokemon)}
                    alt={selectedPokemon.name}
                  />
                </div>

                <div className="type-badges">
                  {selectedPokemon.types.map(function (typeInfo) {
                    const typeName = typeInfo.type.name

                    return (
                      <span
                        key={typeName}
                        className={'type-badge type-' + typeName}
                      >
                        {typeName}
                      </span>
                    )
                  })}
                </div>
              </div>

              <div className="detail-right">
                <div className="detail-header">
                  <h2>{selectedPokemon.name}</h2>

                  <span className="id-badge">
                    #{String(selectedPokemon.id).padStart(3, '0')}
                  </span>
                </div>

                {description !== '' && (
                  <div className="quote-box">
                    <p>{description}</p>
                  </div>
                )}

                <p className="section-title">Abilities</p>

                <div className="ability-badges">
                  {selectedPokemon.abilities.map(function (abilityInfo) {
                    const abilityName = abilityInfo.ability.name

                    return (
                      <span key={abilityName} className="ability-badge">
                        {abilityName}
                      </span>
                    )
                  })}
                </div>

                <div className="info-boxes">
                  <div className="info-box">
                    <p className="info-label">Height</p>
                    <p className="info-value">
                      {selectedPokemon.height / 10} m
                    </p>
                  </div>

                  <div className="info-box">
                    <p className="info-label">Weight</p>
                    <p className="info-value">
                      {selectedPokemon.weight / 10} kg
                    </p>
                  </div>

                  <div className="info-box">
                    <p className="info-label">Base XP</p>
                    <p className="info-value">
                      {selectedPokemon.base_experience}
                    </p>
                  </div>
                </div>

                <p className="section-title">Base Stat Analysis</p>

                <div className="stats">
                  {selectedPokemon.stats.map(function (statInfo) {
                    const percentage = Math.min(
                      (statInfo.base_stat / 200) * 100,
                      100
                    )

                    return (
                      <div className="stat-row" key={statInfo.stat.name}>
                        <span className="stat-name">
                          {statInfo.stat.name.replace('-', ' ')}
                        </span>

                        <div className="stat-bar-bg">
                          <div
                            className="stat-bar-fill"
                            style={{ width: percentage + '%' }}
                          ></div>
                        </div>

                        <span className="stat-value">
                          {statInfo.base_stat}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App