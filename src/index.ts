import                                               "express-async-errors";
import express, { type Response, type Request } from "express";
import { PrismaClient }                         from "@prisma/client";
import { authRoute }                            from "./routes/auth.route";
import cors                                     from "cors";
import dotenv                                   from "dotenv";
import bodyParser                               from "body-parser";
import serverError                              from "./middleware/serverError";
import { userRoute }                            from "./routes/user.route";
import { followRoute }                          from "./routes/follow.route";
import { recipeRoute }                          from "./routes/recipe.route";
import { likeRoute }                            from "./routes/like.route";
import { saveRoute }                            from "./routes/save.route";
import { commentRoute }                         from "./routes/comment.route";
import fs                                       from "fs";
import swaggerUi                                from "swagger-ui-express";
import { handleEntityTooLargeError }            from "./utils/largeFileError";
import { uploadImageRoute }                     from "./routes/upload-image.route";
import { Server }                               from "socket.io";
import http                                     from "http";
import { socket }                               from "./socket/socket.notification";
import cookieParser                             from 'cookie-parser';
import passport                                 from "passport";
import session                                  from 'express-session';
import MongoStore                               from 'connect-mongo';
import                                               './configs/passport.config'

dotenv.config();

export const port          = process.env.PORT as string;
export const clientUrl     = process.env.CLIENT_URL as string;
export const sessionSecret = process.env.SESSION_SECRET as string;
export const sessionDBUrl  = process.env.SESSION_DATABASE_URL as string;

export const app    = express();
export const prisma = new PrismaClient();
const server        = http.createServer(app);

app.use('/uploads', express.static('uploads'));
app.use(cors({
  origin     : clientUrl,
  credentials: true
}));

app.use(session({
  secret           : sessionSecret,
  resave           : false,
  saveUninitialized: false,
  store            : MongoStore.create({
    mongoUrl: sessionDBUrl
  })
}));

app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ limit: '1mb', extended: true }));
app.use(handleEntityTooLargeError);

const existAPISwaggerJson = fs.existsSync("./api-swagger.json");

if (existAPISwaggerJson) {
  const rawData = fs.readFileSync("./api-swagger.json", "utf-8");

  const jsonData = JSON.parse(rawData.replace(/\$\{[A-Z_]+\}/, (match: string) => {
    const env = match.replace(/\${([^}]+)}/, '$1');
    return process.env[env] || '';
  }));

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(jsonData));
}

app.get('/', async (request: Request, response: Response) => {
  try {
    response.send('API works')
  } catch (error) {
    console.log('API error')
  }
});

export const io = new Server(server, {
  cors: {
    origin     : clientUrl,
    credentials: true
  }
});

socket(io);

app.use('/auth', authRoute);
app.use('/user', userRoute);
app.use('/follow', followRoute);
app.use('/recipe', recipeRoute);
app.use('/like', likeRoute);
app.use('/save', saveRoute);
app.use('/comment', commentRoute);
app.use('/upload', uploadImageRoute);

app.use(serverError);

server.listen(port, () => {
  console.log(`Server started at port ${port}!`);
});

export default app;