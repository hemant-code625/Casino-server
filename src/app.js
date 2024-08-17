import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { ApolloServer } from "apollo-server-express";
import { typeDefs, resolvers } from "./utils/gql.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// Routes imports
import userRoutes from "./routes/user.routes.js";
import gameRoutes from "./routes/game.routes.js";
import paymentRouter from "./routes/payment.routes.js";

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/game", gameRoutes);
app.use("/api/v1/payment", paymentRouter);

app.get("/", (req, res) => {
  res.send("Server is live 🚀 Checkout: https://casino-client.vercel.app");
});

const startServer = async () => {
  const server = new ApolloServer({ typeDefs, resolvers });

  await server.start();
  server.applyMiddleware({
    app,
    path: "/graphql",
    cors: {
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    },
  });

  app.listen({ port: 4000 }, () =>
    console.log(`🚀 Server ready at ${process.env.API + server.graphqlPath}`)
  );
};

startServer();

export { app };
