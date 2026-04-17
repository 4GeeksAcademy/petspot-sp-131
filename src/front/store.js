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
    places: []
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

    default:
      throw Error('Unknown action.');
  }
}
