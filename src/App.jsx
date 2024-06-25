import { useEffect, useState, useOptimistic, useRef, useActionState } from "react"

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

  const addNewTodo = async () => {
    const formData = new FormData(formRef.current)
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

  const [actionState, addNewTodoWithState, isPending] = useActionState(addNewTodo)

  useEffect(() => { getTodos().then(setTodos) }, [])

  return (
    <>
      <ul>
        {optimisticTodos.map(todo => (
          <li key={todo.id}>{todo.text}</li>
        ))}
      </ul>
      <form action={addNewTodoWithState} ref={formRef}>
        <input
          type="text"
          name="text"
          disabled={isPending}
          placeholder="New todo"
        />
      </form>
    </>
  )
}

