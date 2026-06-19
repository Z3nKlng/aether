import Fastify from 'fastify'
import websocket from '@fastify/websocket'
import { redis } from '@aether/redis'
import { collaborationServer } from './collaboration'

const fastify = Fastify({
  logger: true
})

fastify.register(websocket)

const sub = redis.duplicate()
sub.subscribe('aether:events')

fastify.register(async function (fastify) {
  // Traditional WebSocket for events and terminal
  fastify.get('/ws', { websocket: true }, (connection, req) => {
    const handler = (channel: string, message: string) => {
      if (channel === 'aether:events') {
        connection.socket.send(message)
      }
    }

    sub.on('message', handler)

    connection.socket.on('message', (message: any) => {
      // Echo for testing
      connection.socket.send(`Echo: ${message.toString()}`)
    })

    connection.socket.on('close', () => {
      sub.off('message', handler)
    })
  })

  // Hocuspocus WebSocket for CRDT collaboration
  fastify.get('/collaboration', { websocket: true }, (connection, req) => {
    collaborationServer.handleConnection(connection.socket, req.raw)
  })
})

const PORT = 4001
fastify.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  console.log(`Realtime server running on http://0.0.0.0:${PORT}`)
})
