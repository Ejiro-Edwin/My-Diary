import * as express from 'express';
import {User} from './user.interface';
import * as jwt from 'jsonwebtoken';
import { Password } from '../services/password';
import { validateRequest, BadRequestError } from '../commons';

class UsersController {
  public path = '/users';
  public router = express.Router();
 
 
  constructor() {
    this.intializeRoutes();
  }
 
  public intializeRoutes() {
    this.router.get(this.path, this.getAllUsers);
    this.router.get(this.path, this.getOneUser);
    this.router.get(this.path, this.signIn);
    this.router.post(this.path, this.createUser);
  }
 
  getAllUsers = async (request: express.Request, response: express.Response) => {
    const AllUsers = await User.find();
    if (!AllUsers) {
    //   throw new BadRequestError('Invalid credentials');
    }
     response.send(AllUsers);
   }


   getOneUser = async (request: express.Request, response: express.Response) => {
    const { email, password } = request.body;
    const user = await User.findOne({email});
    if (!user) {
    //   throw new BadRequestError('Invalid credentials');
    }
     response.send(user);
   }


   signIn = async (request:express.Request, response:express.Response) =>{
    const { email, password } = request.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
    //   throw new BadRequestError('Invalid credentials');
    }

    const passwordsMatch = await Password.compare(
      existingUser.password,
      password
    );
    if (!passwordsMatch) {
    //   throw new BadRequestError('Invalid Credentials');
    }

    // Generate JWT
    const userJwt = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email
      },
      process.env.JWT_KEY!
    );

    // Store it on session object
    request.session = {
      jwt: userJwt
    };

    response.status(200).send(existingUser);
  }
   
 
   createUser = async (request: express.Request, response: express.Response) => {
        const { email, password, firstname, lastname } = request.body;
    
        const existingUser = await User.findOne({ email });
    
        if (existingUser) {
         //throw new BadRequestError('Email in use');
        }
    
        const user = User.build({ email, password, firstname, lastname });
        await user.save();
    
        // Generate JWT
        const userJwt = jwt.sign(
          {
            id: user.id,
            email: user.email
          },
          process.env.JWT_KEY!
        );
    
        // Store it on session object
        request.session = {
          jwt: userJwt
        };
    
        response.status(201).send(user);
      }
    }

 
export default UsersController;