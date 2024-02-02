import express, { type Response, type Request } from "express";

const app = express();

app.get('/', async (request: Request, response: Response) => {
  try {
    response.send('Initial state')
  } catch (error) {
    console.log('Server error')    
  }
});

app.listen(4000, () => {
  console.log("Server started");
})