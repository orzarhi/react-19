import { create } from "zustand";

async function getTodos() {
  const response = await fetch("http://localhost:8080/api/todos");

  return response.json();
}

async function addTodo(text) {
  const response = await fetch("http://localhost:8080/api/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) throw new Error("Failed to add todo");

  return response.json();
}

const useTodos = create((set, get) => ({
  todos: [],
  isPending: false,
  getTodos: async () => {
    const todos = await getTodos();
    set({ todos });
  },
  postTodo: async (text) => {
    const originalTodos = get().todos;
    set({
      isPending: true,
      todos: [
        ...get().todos,
        { id: Date.now(), text, opacity: 0.5 },
      ],
    });

    try {
      await addTodo(text);
      set({ isPending: false, todos: await getTodos() });
    } catch (error) {
      console.error(error);
      set({ isPending: false, todos: originalTodos });
    }
  },
}));

useTodos.getState().getTodos();

export const App = () => {
  const { isPending, todos, postTodo } = useTodos();

  return (
    <>
      <ul>
        {todos.map((todo) => (
          <li
            key={todo.id}
            style={{ opacity: todo?.opacity }}
          >
            {todo.text}
          </li>
        ))}
      </ul>
      <div>
        <input
          type="text"
          disabled={isPending}
          placeholder={'Add todo'}
          onKeyUp={(event) => {
            if (event.key === "Enter") {
              postTodo(event.target.value);
              event.target.value = "";
            }
          }}
        />
      </div>
    </>
  );
}
