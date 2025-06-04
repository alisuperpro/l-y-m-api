import app from '../src/server'
const PORT = process.env.PORT ?? 3500

app.listen(PORT, () => {
    console.log(`Server run on port: ${PORT}`)
})
