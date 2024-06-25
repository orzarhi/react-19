import { useEffect, useState, useOptimistic, useRef } from "react"

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

  const formRef = useRef(null)

  const [optimisticTodos, simplifiedAddTodo] = useOptimistic(todos,
    (state, text) => [...state, { id: Date.now(), text }]
  )

  const addNewTodo = async (formData) => {
    const newTodo = formData.get('text')

    if (!newTodo) return;

    simplifiedAddTodo(newTodo)

    try {
      await addTodo(newTodo)
      setTodos(await getTodos())
    } catch (error) {
      console.error(error)
    } finally {
      formRef.current.reset()
    }

  }


  useEffect(() => { getTodos().then(setTodos) }, [])

  return (
    <>
      <ul>
        {optimisticTodos.map(todo => (
          <li key={todo.id}>{todo.text}</li>
        ))}
      </ul>
      <form action={addNewTodo} ref={formRef}>
        <input
          type="text"
          name="text"
          placeholder="New todo"
        />
      </form>
    </>
  )
}

