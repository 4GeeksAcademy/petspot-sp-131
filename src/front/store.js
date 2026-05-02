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
    citiesWithPlaces: [],
    privatePlace: {},
    reservations: [],
    news: [],
    favorites: [],
    authAdmin: true,
    authUser: false,
    privateUser: {},
    userToken: null,
    nearbyPlaces: []
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
        todos: store.todos.map((todo) =>
          todo.id === id ? { ...todo, background: color } : todo
        )
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
        places: store.places.map((place) =>
          place.id === action.payload.id ? action.payload : place
        )
      }

    case 'DELETE_PLACE':
      return {
        ...store,
        places: store.places.filter((place) => place.id !== action.payload)
      }

    case 'GET_PRIVATE_PLACE':
      return {
        ...store,
        privatePlace: action.payload
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
        cities: store.cities
          .map((city) => city.id === action.payload.id ? action.payload : city)
          .sort((a, b) => a.city.localeCompare(b.city))
      }

    case 'DELETE_CITY':
      return {
        ...store,
        cities: store.cities.filter((city) => city.id !== action.payload)
      }

    case 'GET_CITIES_WITH_PLACES':
      return {
        ...store,
        citiesWithPlaces: action.payload
      }

    case 'set_auth_user':
      return {
        ...store,
        authUser: action.payload
      }

    case 'set_auth_admin':
      return {
        ...store,
        authAdmin: action.payload
      }

    case 'GET_RESERVATIONS':
      return {
        ...store,
        reservations: action.payload
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
        favorites: store.favorites.map((favorite) =>
          favorite.id === action.payload.id ? action.payload : favorite
        )
      }

    case 'DELETE_FAVORITE':
      return {
        ...store,
        favorites: store.favorites.filter((favorite) => favorite.id !== action.payload)
      }

    case 'GET_NEWS':
      return {
        ...store,
        news: action.payload
      }

    case 'ADD_NEWS':
      return {
        ...store,
        news: [action.payload, ...store.news]
      }

    case 'UPDATE_NEWS':
      return {
        ...store,
        news: store.news.map((newsItem) =>
          newsItem.id === action.payload.id ? action.payload : newsItem
        )
      }

    case 'DELETE_NEWS':
      return {
        ...store,
        news: store.news.filter((newsItem) => newsItem.id !== action.payload)
      }

    case 'GET_PRIVATE_USER':
      return {
        ...store,
        privateUser: action.payload
      }

    case "USER_LOGOUT":

      return {
        ...store,
        privateUser: {},
        userToken: null
      }

    case "SET_USER_TOKEN":

      return {
        ...store,
        userToken: action.payload
      }

    case "GET_NEARBY_PLACES":

      return {
        ...store,
        nearbyPlaces: action.payload
      }


    default:
      throw Error('Unknown action.');
  }
}
