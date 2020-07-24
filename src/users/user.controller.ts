import * as express from 'express';
import { User } from './user.interface';
import { body } from 'express-validator';
import * as jwt from 'jsonwebtoken';
import { Password } from '../services/password';
import { BadRequestError, validateRequest } from '../commons/index';

class UsersController {
  public path = '/users';
  public router = express.Router();

  constructor() {
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.get('/', this.getAllUsers);
    this.router.get('/users/getAllUsers', this.getAllUsers);
    this.router.get('/users/getOneUser/:email', this.getOneUser);
    this.router.get(
      '/users/signin',
      [
        body('email').isEmail().withMessage('Email must be valid'),
        body('password')
          .trim()
          .notEmpty()
          .withMessage('You must supply a password'),
      ],
      validateRequest,
      this.signIn
    );
    this.router.post(
      '/users / signup',
      [
        body('email').isEmail().withMessage('Email must be valid'),
        body('password')
          .trim()
          .isLength({ min: 4, max: 20 })
          .withMessage('Password must be between 4 and 20 characters'),
      ],
      validateRequest,
      this.createUser
    );
  }

  getAllUsers = async (
    request: express.Request,
    response: express.Response
  ) => {
    const AllUsers = await User.find();
    if (!AllUsers) {
      throw new BadRequestError('Invalid credentials');
    }
    response.send(AllUsers);
  };

  getOneUser = async (request: express.Request, response: express.Response) => {
    const { email, password } = request.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw new BadRequestError('Invalid credentials');
    }
    response.send(user);
  };

  signIn = async (request: express.Request, response: express.Response) => {
    const { email, password } = request.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new BadRequestError('Invalid credentials');
    }

    const passwordsMatch = await Password.compare(
      existingUser.password,
      password
    );
    if (!passwordsMatch) {
      throw new BadRequestError('Invalid Credentials');
    }

    // Generate JWT
    const userJwt = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
      },
      process.env.JWT_KEY!
    );

    // Store it on session object
    request.session = {
      jwt: userJwt,
    };

    response.status(200).send(existingUser);
  };

  createUser = async (request: express.Request, response: express.Response) => {
    const { email, password, firstname, lastname } = request.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new BadRequestError('Email in use');
    }

    const user = User.build({ email, password, firstname, lastname });
    await user.save();

    // Generate JWT
    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_KEY!
    );

    // Store it on session object
    request.session = {
      jwt: userJwt,
    };

    response.status(201).send(user);
  };
}

export default UsersController;
