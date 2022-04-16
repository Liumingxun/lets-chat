import { Server } from './server'

const app = new Server()
app.listen((port) => {
  console.log(`Server is listening on http://localhost:${port}`)
})
