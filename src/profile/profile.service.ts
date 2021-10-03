import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProfileType } from './types/profile.type';
import { ProfileResponseInterface } from './types/profileResponse.interface';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { FollowEntity } from './follow.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly profileRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,
  ) {}
  async getProfile(userId: number, username: string): Promise<ProfileType> {
    const user = await this.profileRepository.findOne({ username });
    if (!user) {
      throw new HttpException('Profile does not exists', HttpStatus.NOT_FOUND);
    }
    const follow = await this.followRepository.findOne({
      followerId: userId,
      followingId: user.id,
    });

    return { ...user, following: !!follow };
  }

  buildProfileResponse(profile: ProfileType): ProfileResponseInterface {
    delete profile.email;
    return {
      profile,
    };
  }

  async followProfile(userId: number, username: string): Promise<ProfileType> {
    const user = await this.profileRepository.findOne({ username });
    if (!user) {
      throw new HttpException('Profile does not exists', HttpStatus.NOT_FOUND);
    }
    if (userId === user.id) {
      throw new HttpException(
        `Follower and following cant be equal`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const follow = await this.followRepository.findOne({
      followerId: userId,
      followingId: user.id,
    });
    if (!follow) {
      const followCreate = new FollowEntity();
      followCreate.followerId = userId;
      followCreate.followingId = user.id;
      await this.followRepository.save(followCreate);
    }
    return { ...user, following: true };
  }

  async unFollowProfile(
    userId: number,
    username: string,
  ): Promise<ProfileType> {
    const user = await this.profileRepository.findOne({ username });
    if (!user) {
      throw new HttpException('Profile does not exists', HttpStatus.NOT_FOUND);
    }
    if (userId === user.id) {
      throw new HttpException(
        `Follower and following cant be equal`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const follow = await this.followRepository.findOne({
      followerId: userId,
      followingId: user.id,
    });
    if (!follow) {
      throw new HttpException(
        'You dont follow this user',
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.followRepository.delete(follow);

    return { ...user, following: false };
  }
}
