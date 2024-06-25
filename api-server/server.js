import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());

app.use(cors());

const todos = [
    { id: 1, text: "Learn Vite 2" },
    { id: 2, text: "Learn React" },
];

app.get('/api/todos', (req, res) => {
    res.json(todos)
});

app.post('/api/todos', (req, res) => {
    setTimeout(() => {
        const body = req.body || {};

        if (body?.text !== 'error') {
            const todo = {
                id: todos.length + 1,
                text: body.text ?? '',
            }

            todos.push(todo);
            res.json(todo);
        } else {
            res.status(400).json({ error: 'Failed to add todo' });
        }
    }, 3000)
})

app.listen(8080, () => {
    console.log('Server is running on port 8080');
})