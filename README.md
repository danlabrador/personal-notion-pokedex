# Notion Pokedex

This JavaScript application fetches data about Pokemon from the PokeAPI.

## Features

- Fetches data about a Pokemon's weight, attack, defense, special attack, special defense, speed, sprite, artwork, and Bulbapedia URL.
- Logs the name of the Pokemon being fetched from the PokeAPI.
- Stores the fetched Pokemon data in an array.
- Fetches additional species data for each Pokemon in the array.

## Code Snippet

### Fetching from PokeAPI

```js
"weight": data.weight,
"attack": data.stats[1].base_stat,
"defense": data.stats[2].base_stat,
"special-attack": data.stats[3].base_stat,
"special-defense": data.stats[4].base_stat,
"speed": data.stats[5].base_stat,
"sprite": sprite,
"artwork": data.sprites.other['official-artwork'].front_default,
"bulbURL": bulbURL,
```

This snippet shows how the application fetches various data about a Pokemon from the PokeAPI.

### Storing Data in Notion

This application also integrates with the Notion API to store the fetched Pokemon data. After fetching the data from the PokeAPI, it is formatted into a structure compatible with the Notion API and then sent to a specified Notion database. This allows for easy access and manipulation of the data within the Notion platform.

Please ensure you have the necessary permissions and API keys to interact with your desired Notion database.

```js
// Example of storing data in Notion
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID;

async function addItem(pokemonData) {
  try {
    await notion.pages.create({
      parent: { database_id: databaseId },
      properties: pokemonData
    });
    console.log('Success! Entry added to Notion database.');
  } catch (error) {
    console.error('Error: ', error.body);
  }
}
```

This snippet shows how the application uses the Notion API to store the fetched Pokemon data.

## Dependencies

This application requires axios for making HTTP requests to the PokeAPI.

## Note

This script was initially developed after following [Thomas Frank's tutorial on how to use Notion API](https://www.youtube.com/watch?v=ec5m6t77eYM).
