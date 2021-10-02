import { Request } from 'express';
import { UserEntity } from '../user/user.entity';

export interface RequestExpressInterface extends Request {
  user?: UserEntity;
}
