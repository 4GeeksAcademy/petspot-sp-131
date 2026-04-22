export const initialStore = () => {
  return {
    message: null,
    todos: [
      {
        id: 1,
        title: "Make the bed",
        background: null,
      },
      {
        id: 2,
        title: "Do my homework",
        background: null,
      }
    ],
    places: [],
    cities: [],
    favorites: []
  }
}

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case 'set_hello':
      return {
        ...store,
        message: action.payload
      };

    case 'add_task':

      const { id, color } = action.payload

      return {
        ...store,
        todos: store.todos.map((todo) => (todo.id === id ? { ...todo, background: color } : todo))
      };

    case 'GET_PLACES':
      return {
        ...store,
        places: action.payload
      }

    case 'ADD_PLACE':
      return {
        ...store,
        places: [action.payload, ...store.places]
      }

    case 'UPDATE_PLACE':
      return {
        ...store,
        places: store.places.map((place) => place.id === action.payload.id ? action.payload : place)
      }

    case 'DELETE_PLACE':
      return {
        ...store,
        places: store.places.filter((place) => place.id !== action.payload)
      }

    case 'GET_CITIES':
      return {
        ...store,
        cities: action.payload
      }

    case 'ADD_CITY':
      return {
        ...store,
        cities: [...store.cities, action.payload].sort((a, b) => a.city.localeCompare(b.city))
      }

    case 'UPDATE_CITY':
      return {
        ...store,
        cities: store.cities.map((city) => city.id === action.payload.id ? action.payload : city).sort((a, b) => a.city.localeCompare(b.city))
      }

    case 'DELETE_CITY':
      return {
        ...store,
        cities: store.cities.filter((city) => city.id !== action.payload)
      }

    case 'GET_FAVORITES':
      return {
        ...store,
        favorites: action.payload
      }

    case 'ADD_FAVORITE':
      return {
        ...store,
        favorites: [action.payload, ...store.favorites]
      }

    case 'UPDATE_FAVORITE':
      return {
        ...store,
        favorites: store.favorites.map((favorite) => favorite.id === action.payload.id ? action.payload : favorite)
      }

    case 'DELETE_FAVORITE':
      return {
        ...store,
        favorites: store.favorites.filter((favorite) => favorite.id !== action.payload)
      }

    default:
      throw Error('Unknown action.');
  }
}
