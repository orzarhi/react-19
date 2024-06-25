import { useMutation, useQuery } from "@tanstack/react-query"
import { useActionState, useOptimistic, useRef } from "react"

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
  const { data: todos, refetch } = useQuery({
    queryKey: ['todos'],
    queryFn: getTodos,
    initialData: []
  })


  const formRef = useRef(null)

  const [optimisticTodos, simplifiedAddTodo] = useOptimistic(todos,
    (state, text) => [...state, { id: Date.now(), text }]
  )


  const { mutateAsync: addTodoMutation } = useMutation({
    mutationKey: ['addTodo'],
    onMutate: simplifiedAddTodo,
    mutationFn: addTodo,
    onSuccess: refetch

  })

  const addNewTodo = async () => {
    const formData = new FormData(formRef.current)
    const newTodo = formData.get('text')

    if (!newTodo) return;

    try {
      await addTodoMutation(newTodo)
    } catch (error) {
      console.error(error)
    } finally {
      formRef.current.reset()
    }

  }

  const [actionState, addNewTodoWithState, isPending] = useActionState(addNewTodo)


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

