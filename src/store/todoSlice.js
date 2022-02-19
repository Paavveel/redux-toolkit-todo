import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchTodos = createAsyncThunk(
  'todos/fetchTodos',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        'https://jsonplaceholder.typicode.com/todos?_limit=15'
      );

      return res.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTodo = createAsyncThunk(
  'todos/deleteTodo',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await axios.delete(`https://jsonplaceholder.typicode.com/todos/${id}`);

      dispatch(removeTodo({ id }));
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleStatus = createAsyncThunk(
  'todos/toggleStatus',
  async (id, { rejectWithValue, dispatch, getState }) => {
    const todo = getState().todos.todos.find(todo => todo.id === id);

    try {
      await axios.patch(`https://jsonplaceholder.typicode.com/todos/${id}`, {
        completed: !todo.completed,
      });
      dispatch(toggleComplete({ id }));
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addNewTodo = createAsyncThunk(
  'todos/addNewTodo',
  async (text, { rejectWithValue, dispatch }) => {
    const todo = {
      userId: 1,
      title: text,
      completed: false,
    };

    try {
      const res = await axios.post(
        `https://jsonplaceholder.typicode.com/todos/`,
        todo
      );

      dispatch(addTodo(res.data));
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const setError = (state, action) => {
  state.status = 'rejected';
  state.error = action.payload;
};

const setLoading = state => {
  state.status = 'loading';
  state.error = null;
};

const todoSlice = createSlice({
  name: 'todos',
  initialState: {
    todos: [],
    status: null,
    error: null,
  },
  reducers: {
    addTodo(state, action) {
      state.todos.push(action.payload);
    },
    toggleComplete(state, action) {
      const toggledTodo = state.todos.find(
        todo => todo.id === action.payload.id
      );
      toggledTodo.completed = !toggledTodo.completed;
    },
    removeTodo(state, action) {
      state.todos = state.todos.filter(todo => todo.id !== action.payload.id);
    },
  },
  extraReducers: {
    [fetchTodos.pending]: setLoading,
    [fetchTodos.fulfilled]: (state, action) => {
      state.status = 'resolved';
      state.todos = action.payload;
    },
    [fetchTodos.rejected]: setError,
    [deleteTodo.pending]: setLoading,
    [deleteTodo.fulfilled]: (state, action) => {
      state.status = 'resolved';
    },
    [deleteTodo.rejected]: setError,
    [toggleStatus.pending]: setLoading,
    [toggleStatus.fulfilled]: (state, action) => {
      state.status = 'resolved';
    },
    [toggleStatus.rejected]: setError,
    [addNewTodo.pending]: setLoading,
    [addNewTodo.fulfilled]: (state, action) => {
      state.status = 'resolved';
    },
    [addNewTodo.rejected]: setError,
  },
});

const { addTodo, toggleComplete, removeTodo } = todoSlice.actions;

export default todoSlice.reducer;
