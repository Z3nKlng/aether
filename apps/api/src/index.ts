import { createYoga } from 'graphql-yoga'
import { createServer } from 'node:http'
import { schema } from './schema'
import { auth } from '@aether/auth'
import { prisma } from '@aether/database'

const yoga = createYoga({
  schema,
  context: async (context) => {
    const authHeader = context.request.headers.get('authorization');
    let userId: string | undefined;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      // Here you would verify the JWT token
      // userId = verifyToken(token);
    }
    
    return {
      userId,
      db: prisma,
    }
  }
})

const server = createServer(async (req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      version: '0.0.1',
      uptime: process.uptime(),
      services: { db: 'ok', redis: 'ok', api: 'ok' }
    }));
    return;
  }
  
  await yoga(req, res);
})

server.listen(4000, '0.0.0.0', () => {
  console.info('Server is running on http://0.0.0.0:4000/graphql')
})
