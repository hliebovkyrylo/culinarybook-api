import express, { 
  type Response, 
  type Request 
}                       from "express";
import { PrismaClient } from "@prisma/client";
import { authRoute }    from "./routes/auth.route";
import cors             from "cors";
import dotenv           from "dotenv";
import bodyParser       from "body-parser";
import serverError      from "./middleware/serverError";
import { userRoute }    from "./routes/user.route";
import { followRoute }  from "./routes/follow.route";
import { recipeRoute }  from "./routes/recipe.route";
import { likeRoute }    from "./routes/like.route";
import { saveRoute }    from "./routes/save.route";
import { commentRoute } from "./routes/comment.route";

dotenv.config();

export const app    = express();
export const prisma = new PrismaClient();

app.use(cors());
app.use(bodyParser.json());

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

app.use(serverError);

app.listen(4000, () => {
  console.log("Server started");
});