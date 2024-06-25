import { useEffect, useState, useOptimistic, useTransition } from "react"

const getTodos = async () => {
  const response = await fetch('http://localhost:8080/api/todos')

  return response.json()
}

const addTodo = async (text) => {
  const response = await fetch('http://localhost:8080/api/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  })

  if (!response.ok) throw new Error('Failed to add todo')

  return response.json()
}

export const App = () => {
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState('')

  const [optimisticTodos, simplifiedAddTodo] = useOptimistic(todos,
    (state, text) => [...state, { id: Date.now(), text }]
  )
  const [isPending, startTransition] = useTransition()

  const addNewTodo = async () => {
    if (!newTodo) return;

    simplifiedAddTodo(newTodo)

    await addTodo(newTodo)
    setTodos(await getTodos())
    setNewTodo('')

  }


  useEffect(() => { getTodos().then(setTodos) }, [])

  return (
    <>
      <ul>
        {optimisticTodos.map(todo => (
          <li key={todo.id}>{todo.text}</li>
        ))}
      </ul>
      <div>
        <input
          type="text"
          disabled={isPending}
          placeholder="New todo"
          value={newTodo}
          onChange={({ target }) => setNewTodo(target.value)}
          onKeyUp={({ key }) => {
            if (key === 'Enter') startTransition(() => addNewTodo())
          }}
        />
      </div>
    </>
  )
}

