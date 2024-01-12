require('dotenv').config();
const axios = require('axios');
const { Client }  = require('@notionhq/client');
const notion = new Client({auth: process.env.NOTION_KEY});

const pokemonArray = [];

const getPokemon = async() => {
  try {

    for (let i = 1; i < 501; i++){
      const { data } = await axios.get(`https://pokeapi.co/api/v2/pokemon/${i}`);

      // Format name
      const processedName = data.species.name
        .split(/-/).map(word => word[0].toUpperCase() + word.slice(1)).join(' ') // Capitalize first letter of each word
        .replace(/^Mr M/, 'Mr. M')
        .replace(/^Mime Jr/, 'Mime Jr.')
        .replace(/^Nidoran F/, 'Nidoran♀')
        .replace(/^Nidoran M/, 'Nidoran♂')
        .replace(/^Ho Oh/, 'Ho-Oh')
        .replace(/^Mime Jr/, 'Mime Jr.')
        .replace(/^Farfetchd/, "Farfetch'd")
        .replace(/^Porygon Z/, 'Porygon-Z')
        .replace(/^Jangmo O/, 'Jangmo-o')
        .replace(/^Hakamo O/, 'Hakamo-o')
        .replace(/^Kommo O/, 'Kommo-o')
        .replace(/^Type Null/, 'Type: Null')
        .replace(/mo O/, 'mo-o')
        .replace(/Flabebe/, 'Flabébé')


      // Create types array
      const typesArray = [];

      for (let type of data.types){
        const typeObject = {
          "name": type.type.name,
        }
        typesArray.push(typeObject);
      }

  
      // Check if pokemon has official artwork, if not use default sprite
      const sprite = !data.sprites.front_default
        ? data.sprites.other['official-artwork'].front_default
        : data.sprites.front_default;

      // Create bulb URL
      const bulbURL = `https://bulbapedia.bulbagarden.net/wiki/${processedName.replace(" ","_")}_(Pok%C3%A9mon)`;

      // Create pokemon object
      const pokemon = {
        "name": processedName,
        "number": data.id,
        "types": typesArray,
        "hp": data.stats[0].base_stat,
        "height": data.height,
        "weight": data.weight,
        "attack": data.stats[1].base_stat,
        "defense": data.stats[2].base_stat,
        "special-attack": data.stats[3].base_stat,
        "special-defense": data.stats[4].base_stat,
        "speed": data.stats[5].base_stat,
        "sprite": sprite,
        "artwork": data.sprites.other['official-artwork'].front_default,
        "bulbURL": bulbURL,
      };
  
      console.log(`Fetching ${pokemon.name} from PokeAPI.`)
      pokemonArray.push(pokemon);
    }

    // Get other pokemon-species data
    for (let pokemon of pokemonArray) {
      const { data } = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${pokemon.number}`);

      pokemon['flavor-text'] = data.flavor_text_entries
        .find(({ language: { name }}) => name === 'en')
        .flavor_text
        .replace(/\n|\r|\f/g, ' ')

      
      pokemon['category'] = data.genera
        .find(({ language: { name }}) => name === 'en')
        .genus

      pokemon['generation'] = data.generation.name.split(/-/).pop().toUpperCase()
      
      console.log(`Fetched flavored text for ${pokemon.name} from PokeAPI.`)
    }
    await createNotionPage();
  } catch {
    console.log(`Error fetching pokemon from PokeAPI.`);
  }

}

const createNotionPage = async () => {
  for (let pokemon of pokemonArray) {
    try{
      await notion.pages.create({
        "parent": {
          "database_id": process.env.NOTION_DATABASE_ID,
        },
  
        "cover": {
          "type": "external",
          "external": {
            "url": pokemon.artwork
          }
        },
  
        "icon": {
          "type": "external",
          "external": {
            "url": pokemon.sprite
          }
        },
        
        "properties": {
          "Name": {
            "title": [
              {
                "type": 'text',
                "text": {
                  "content": pokemon.name
                }
              }
            ]
          },
  
          "No": { "number": pokemon.number },
          "HP": { "number": pokemon.hp },
          "Height": { "number": pokemon.height },
          "Weight": { "number": pokemon.weight },
          "Attack": { "number": pokemon.attack },
          "Defense": { "number": pokemon.defense },
          "Sp. Attack": { "number": pokemon['special-attack'] },
          "Sp. Defense": { "number": pokemon['special-defense'] },
          "Speed": { "number": pokemon.speed },
          "Type": { "multi_select": pokemon.types },
          "Generation": { "select": { "name": pokemon.generation }},
          "Category": { "rich_text": [{
            "type": "text",
            "text": {
              "content": pokemon.category
            }
          }]
        },
  
        },
  
        "children": [
          {
            "object": "block",
            "type": "quote",
            "quote": {
              "rich_text": [
                {
                  "type": "text",
                  "text": {
                    "content": pokemon['flavor-text']
                  }
                }
              ]
            }
          },
          {
            "object": "block",
            "type": "paragraph",
            "paragraph": {
              "rich_text": [
                {
                  "type": "text",
                  "text": {
                    "content": ""
                  }
                }
              ]
            }
          },
          {
            "object": "block",
            "type": "bookmark",
            "bookmark": {
              "url": pokemon.bulbURL
            }
          }
        ]
        });
      console.log(`Created ${pokemon.name} in Notion.`)
    } catch {
      console.log(`Error creating ${pokemon.name} in Notion.`);
    }
  }

  console.log('Done!')
}

getPokemon();