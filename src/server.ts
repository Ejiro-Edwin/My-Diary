import App from './app';
import UsersController from './users/user.controller';
 
const app = new App(
  [
    new UsersController(),
  ],
  process.env.PORT!,
);
 
app.listen();