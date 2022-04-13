import type { Server as HTTPServer } from 'http'
import { createServer } from 'http'
import path from 'path'
import { fileURLToPath } from 'url'
import type { Application } from 'express'
import type { Server as SocketIOServer } from 'socket.io'
import express from 'express'
import { Server as SocketIO } from 'socket.io'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export class Server {
  private httpServer!: HTTPServer
  private app!: Application
  private io!: SocketIOServer
  private port

  constructor(port?: number) {
    this.port = port ?? 5000
    this.initialize()
  }

  private initialize() {
    this.app = express()
    this.httpServer = createServer(this.app)
    this.io = new SocketIO(this.httpServer)

    this.configureApp()
    this.configureRoutes()
    this.handleSocketConnection()
  }

  // todo: 解耦
  private configureRoutes() {
    this.app.get('/', (_req, res) => {
      res.sendFile('index.html')
    })
  }

  // todo: 解耦
  private configureApp(): void {
    this.app.use(express.static(path.resolve(__dirname, '../public')))
  }

  private handleSocketConnection() {
    this.io.on('connection', (socket) => {
      console.log('socket connection', socket)
    })
  }

  public listen(callback: (port: number) => void): void {
    this.httpServer.listen(this.port, () => callback(this.port))
  }

  public getRequestListener() {
    return this.app
  }
}
