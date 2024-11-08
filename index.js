const express = require('express')
const cors = require('cors')
const app = express()

const Note = require('./models/note')

app.use(express.static('dist'))
app.use(express.json())
app.use(requestLogger)
app.use(cors())


app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/notes', (request, response) => {
    Note.find({}).then(notes => {
        response.json(notes)
    })
})

app.get('/api/notes/:id', (request, response, next) => {
    Note.findById(request.params.id)
        .then(note => {
            if (note) {
                response.json(note)
            } else {
                response.status(404).end()
            }
    })
        .catch(error => next(error))

})

app.post('/api/notes', (request, response) => {
    const body = request.body

    if (body.content === undefined){
        return response.status(400).json({ error: 'content missing' })
    }
    
    const note = new Note({
        content: body.content,
        important: body.important || false, 
    })

    note.save().then(savedNote => {
        response.json(savedNote)
    })
})

app.delete('/api/notes/:id', (request, response) => {
    const id = request.params.id
    notes = notes.filter(note => note.id !== id)

    response.status(204).end()
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  next(error)
}

app.use(errorHandler)
