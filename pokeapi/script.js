document.addEventListener('DOMContentLoaded', () => {
    const pokemonNumberInput = document.getElementById('pokemonNumber');
    const searchButton = document.getElementById('searchButton');
    const previousButton = document.getElementById('previousButton');
    const nextButton = document.getElementById('nextButton');
    const toggleShinyButton = document.getElementById('toggleShinyButton');
    const pokemonName = document.getElementById('pokemonName');
    const pokemonNumberDisplay = document.getElementById('pokemonNumberDisplay');
    const pokemonImage = document.getElementById('pokemonImage');
    const pokemonType = document.getElementById('pokemonType');
    const pokemonDescription = document.getElementById('pokemonDescription');
    const pokemonStats = document.getElementById('pokemonStats');
    const pokemonEvolution = document.getElementById('pokemonEvolution');
    const pokemonMoves = document.getElementById('pokemonMoves');

    let currentPokemonId = 1;
    let isShiny = false;

    const statTranslations = {
        hp: 'PS',
        attack: 'Ataque',
        defense: 'Defensa',
        'special-attack': 'Ataque Especial',
        'special-defense': 'Defensa Especial',
        speed: 'Velocidad'
    };

    const fetchData = async (url) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error('ERROR');
        return response.json();
    };

    const updatePokemonData = async (id) => {
        try {
            const pokemonData = await fetchData(`https://pokeapi.co/api/v2/pokemon/${id}`);
            const speciesData = await fetchData(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
            currentPokemonId = id;
            isShiny = false;

            pokemonName.textContent = pokemonData.name;
            pokemonNumberDisplay.textContent = `No ${pokemonData.id}`;
            pokemonImage.src = pokemonData.sprites.front_default;

            const typeNames = await Promise.all(pokemonData.types.map(async typeInfo => {
                const typeData = await fetchData(typeInfo.type.url);
                const typeNameInSpanish = typeData.names.find(name => name.language.name === 'es').name;
                return `<span class="type ${typeInfo.type.name}">${typeNameInSpanish}</span>`;
            }));
            pokemonType.innerHTML = typeNames.join('');

            const flavorTextEntry = speciesData.flavor_text_entries.find(entry => entry.language.name === 'es') ||
                                    speciesData.flavor_text_entries.find(entry => entry.language.name === 'en');
            pokemonDescription.textContent = flavorTextEntry ? flavorTextEntry.flavor_text : 'Descripción no disponible';

            pokemonStats.innerHTML = pokemonData.stats.map(stat => `<li>${statTranslations[stat.stat.name]}: ${stat.base_stat}</li>`).join('');

            const evolutionChain = await fetchData(speciesData.evolution_chain.url);
            pokemonEvolution.innerHTML = getEvolutionChainImages(evolutionChain.chain).join('');

            const moveNames = await Promise.all(pokemonData.moves.slice(0, 4).map(async move => {
                const moveData = await fetchData(move.move.url);
                const moveNameInSpanish = moveData.names.find(name => name.language.name === 'es').name;
                return `<li>${moveNameInSpanish}</li>`;
            }));
            pokemonMoves.innerHTML = moveNames.join('');

        } catch (error) {
            console.error('Error updating Pokémon data:', error);
            alert('Pokémon no encontrado');
            showNotFoundMessage();
        }
    };

    const getEvolutionChainImages = (chain) => {
        const evolutionImages = [];
        let current = chain;

        do {
            const id = getIdFromUrl(current.species.url);
            evolutionImages.push(`
                <div class="evolution-stage">
                    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png" alt="${current.species.name}">
                    <p>${current.species.name}</p>
                </div>
            `);
            current = current.evolves_to[0];
        } while (current);

        return evolutionImages;
    };

    const getIdFromUrl = (url) => {
        const parts = url.split('/');
        return parts[parts.length - 2];
    };

    const showNotFoundMessage = () => {
        pokemonName.textContent = 'Pokémon no encontrado';
        pokemonNumberDisplay.textContent = '';
        pokemonImage.src = '';
        pokemonType.innerHTML = '';
        pokemonDescription.textContent = '';
        pokemonStats.innerHTML = '';
        pokemonEvolution.innerHTML = '';
        pokemonMoves.innerHTML = '';
    };

    searchButton.addEventListener('click', async () => {
        const id = pokemonNumberInput.value;
        if (id) {
            try {
                await updatePokemonData(id);
            } catch (error) {
                alert('Pokémon no encontrado');
                showNotFoundMessage();
            }
        }
    });

    nextButton.addEventListener('click', async () => {
        try {
            const nextId = currentPokemonId + 1;
            const pokemonData = await fetchData(`https://pokeapi.co/api/v2/pokemon/${nextId}`);
            if (pokemonData && pokemonData.name) {
                currentPokemonId = nextId;
                await updatePokemonData(currentPokemonId);
            } else {
                alert('Pokémon no encontrado');
                showNotFoundMessage();
            }
        } catch (error) {
            console.error('Error al cargar el Pokémon:', error);
            alert('Error al cargar el Pokémon');
            showNotFoundMessage();
        }
    });
    
    previousButton.addEventListener('click', async () => {
        try {
            const previousId = currentPokemonId - 1;
            if (previousId >= 1) {
                const pokemonData = await fetchData(`https://pokeapi.co/api/v2/pokemon/${previousId}`);
                if (pokemonData && pokemonData.name) {
                    currentPokemonId = previousId;
                    await updatePokemonData(currentPokemonId);
                } else {
                    alert('Pokémon no encontrado');
                    showNotFoundMessage();
                }
            }
        } catch (error) {
            console.error('Error al cargar el Pokémon:', error);
            alert('Error al cargar el Pokémon');
            showNotFoundMessage();
        }
    });
    

    toggleShinyButton.addEventListener('click', async () => {
        try {
            const pokemonData = await fetchData(`https://pokeapi.co/api/v2/pokemon/${currentPokemonId}`);
            isShiny = !isShiny;
            pokemonImage.src = isShiny ? pokemonData.sprites.front_shiny : pokemonData.sprites.front_default;
        } catch (error) {
            console.error('Error toggling shiny image:', error);
        }
    });

    updatePokemonData(1); 
});


