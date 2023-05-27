const { response, json } = require('express')
const express = require('express')
const morgan = require('morgan')
const app = express()

let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

const getID = () => Math.floor(Math.random() * 1000000)

// app.use(morgan('tiny'))
// Define a custom token for logging the colored status code
morgan.token('colored-status', (req, res) => {
    const status = res.statusCode;
    let color;

    if (status >= 500) {
        color = '\x1b[31m'; // Red
    } else if (status >= 400) {
        color = '\x1b[33m'; // Yellow
    } else if (status >= 300) {
        color = '\x1b[36m'; // Cyan
    } else {
        color = '\x1b[32m'; // Green
    }

    return color + status + '\x1b[0m'; // Reset color
});
morgan.token('data', (req, res) => {
    if (req.method === 'POST') {
        return JSON.stringify(req.body)
    } else {
        return ''
    }
})
// app.use(morgan(':method :url :status :res[content-length] - :response-time ms - :data'))
app.use(morgan((tokens, req, res) => {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        // tokens.status(req, res),
        tokens['colored-status'](req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        tokens.data(req, res)
    ].join(' ')
}))
app.use(express.json())
app.use(express.static('build'))

app.get('/', (request, response) => {
    response.send('<h1>Hello world</h1>')
})

app.get('/info', (request, response) => {
    const result = `
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${new Date()}</p>
    `
    response.send(result)
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    // console.log(request.headers)
    const body = request.body
    if (!body.name) {
        return response.status(400).json({
            error: 'name missing'
        })
    }
    if (!body.number) {
        return response.status(400).json({
            error: 'number missing'
        })
    }
    if (persons.find(person => person.name === body.name)) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }

    const person = {
        name: body.name,
        number: body.number,
        id: getID()
    }
    persons = persons.concat(person)

    response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})
