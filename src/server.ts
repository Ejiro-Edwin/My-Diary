import App from './app';
import UsersController from './users/user.controller';
require('dotenv').config();

const app = new App([new UsersController()], process.env.PORT!);

app.listen();
