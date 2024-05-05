import express, { 
  type Response, 
  type Request 
}                                    from "express";
import { PrismaClient }              from "@prisma/client";
import { authRoute }                 from "./routes/auth.route";
import cors                          from "cors";
import dotenv                        from "dotenv";
import bodyParser                    from "body-parser";
import serverError                   from "./middleware/serverError";
import { userRoute }                 from "./routes/user.route";
import { followRoute }               from "./routes/follow.route";
import { recipeRoute }               from "./routes/recipe.route";
import { likeRoute }                 from "./routes/like.route";
import { saveRoute }                 from "./routes/save.route";
import { commentRoute }              from "./routes/comment.route";
import fs                            from "fs";
import swaggerUi                     from "swagger-ui-express";
import { notificationRoute }         from "./routes/notification.route";
import { handleEntityTooLargeError } from "./utils/largeFileError";
import { uploadImageRoute }          from "./routes/upload-image.route";

dotenv.config();

export const app    = express();
export const prisma = new PrismaClient();
export const port   = process.env.PORT as string;

app.use('/uploads', express.static('uploads'));
app.use(cors());
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

app.use('/auth', authRoute);
app.use('/user', userRoute);
app.use('/follow', followRoute);
app.use('/recipe', recipeRoute);
app.use('/like', likeRoute);
app.use('/save', saveRoute);
app.use('/comment', commentRoute);
app.use('/notification', notificationRoute);
app.use('/upload', uploadImageRoute);

app.use(serverError);

app.listen(port, () => {
  console.log("Server started");
});