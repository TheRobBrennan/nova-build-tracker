import http from 'node:http';
import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { typeDefs } from './schema';
import { resolvers } from './resolvers/index';
import { createContext } from './context';
import { createLoaders } from './loaders';

const adapter = new PrismaPg({ connectionString: process.env['DATABASE_URL']! });
const db = new PrismaClient({ adapter });

const schema = makeExecutableSchema({ typeDefs, resolvers });

const app = express();
const httpServer = http.createServer(app);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});

wsServer.on('connection', (socket, request) => {
  console.log('[ws raw] connection from origin:', request.headers.origin, '| protocol:', socket.protocol);
  socket.on('error', (err: Error) => console.error('[ws raw] socket error:', err.message));
  socket.on('close', (code: number, reason: Buffer) =>
    console.log('[ws raw] socket closed:', code, reason.toString()));
});

const serverCleanup = useServer(
  {
    schema,
    context: () => ({ db, loaders: createLoaders(db) }),
    onConnect: () => {
      console.log('[ws] client connected');
      return true;
    },
    onDisconnect: () => console.log('[ws] client disconnected'),
    onError: (ctx: unknown, msg: unknown, errors: unknown) =>
      console.error('[ws] error:', errors),
  },
  wsServer
);

const server = new ApolloServer({
  schema,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

async function startServer() {
  await server.start();

  app.use(
    '/graphql',
    cors<cors.CorsRequest>({ origin: '*' }),
    express.json(),
    expressMiddleware(server, {
      context: async () => createContext(db),
    })
  );

  const PORT = parseInt(process.env['PORT'] ?? '4000', 10);

  httpServer.listen(PORT, () => {
    console.log(`🚀  API ready at    http://localhost:${PORT}/graphql`);
    console.log(`🔌  WS  ready at    ws://localhost:${PORT}/graphql`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
