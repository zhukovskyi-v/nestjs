import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/createUser.dto';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { sign } from 'jsonwebtoken';
import { JWT_KEY } from '../config';
import { UserResponseInterface } from './types/userResponse.interface';
import { LoginUserDto } from './dto/loginUser.dto';
import { compare } from 'bcrypt';
import { UpdateUserDto } from './dto/updateUser.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}
  private static generateJwt(user: UserEntity) {
    return sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      JWT_KEY,
    );
  }

  findById(id: number) {
    return this.userRepository.findOne(id);
  }
  async createUser(createUserDto: CreateUserDto) {
    const errorsResponse = {
      errors: {},
    };
    const userByEmail = await this.userRepository.findOne({
      email: createUserDto.email,
    });
    const userByUserName = await this.userRepository.findOne({
      username: createUserDto.username,
    });
    if (userByEmail) {
      errorsResponse.errors['email'] = 'has already been taken';
      throw new HttpException(errorsResponse, HttpStatus.UNPROCESSABLE_ENTITY);
    }
    if (userByUserName) {
      errorsResponse.errors['username'] = 'has already been taken';

      throw new HttpException(errorsResponse, HttpStatus.UNPROCESSABLE_ENTITY);
    }
    const newUser = new UserEntity();
    Object.assign(newUser, createUserDto);
    return await this.userRepository.save(newUser);
  }

  async loginUser(loginUser: LoginUserDto): Promise<UserEntity> {
    const errorsResponse = {
      errors: {},
    };
    const userByEmail = await this.userRepository.findOne(
      {
        email: loginUser.email,
      },
      { select: ['email', 'bio', 'image', 'id', 'password', 'username'] },
    );
    if (!userByEmail) {
      errorsResponse.errors['email'] = 'has already been taken';

      throw new HttpException(errorsResponse, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const isPasswordCorrect = await compare(
      loginUser.password,
      userByEmail.password,
    );

    if (isPasswordCorrect) {
      delete userByEmail.password;
      return userByEmail;
    }
    errorsResponse.errors['password'] = 'password incorrect';
    throw new HttpException(errorsResponse, 403);
  }
  async getAllUsers(): Promise<UserEntity[]> {
    return await this.userRepository.find();
  }

  async updateUser(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    const user = await this.findById(userId);
    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  buildUserResponse(user: UserEntity): UserResponseInterface {
    return {
      user: {
        ...user,
        token: UserService.generateJwt(user),
      },
    };
  }
}
