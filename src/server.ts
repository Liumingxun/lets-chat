import type { Server as HTTPServer } from 'http'
import { createServer } from 'http'
import path from 'path'
import type { Application } from 'express'
import type { Server as SocketIOServer } from 'socket.io'
import express from 'express'
import { Server as SocketIO } from 'socket.io'

export class Server {
  private httpServer!: HTTPServer
  private app!: Application
  private io!: SocketIOServer
  private activeSockets: string[] = []
  private port

  constructor(port?: number) {
    this.port = port ?? 5000
    this.initialize()
  }

  private initialize() {
    this.app = express()
    this.httpServer = createServer(this.app)
    this.io = new SocketIO(this.httpServer, {
      cors: {
        origin: 'http://192.168.31.123:5000',
        methods: ['GET', 'POST'],
      },
    })

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
    // 当有 socket 连接时
    this.io.on('connection', (socket) => {
      const exist = this.activeSockets.find(item => item === socket.id)
      if (!exist) {
        // 如果是新连接
        this.activeSockets.push(socket.id)
        // 给当前新连接更新用户列表
        socket.emit('update-user-list', {
          user: this.activeSockets.filter(item => item !== socket.id),
        })
        // 给其他连接更新用户列表
        socket.broadcast.emit('update-user-list', {
          user: [socket.id],
        })
      }
      console.log(this.activeSockets)
      socket.on('disconnect', () => {
        this.activeSockets = this.activeSockets.filter(exist => exist !== socket.id)
        socket.broadcast.emit('remove-user', {
          socketId: socket.id,
        })
      })
    })
  }

  public listen(callback?: (port: number) => void): void {
    this.httpServer.listen(this.port, () => callback?.(this.port))
  }

  public getRequestListener() {
    return this.app
  }
}
