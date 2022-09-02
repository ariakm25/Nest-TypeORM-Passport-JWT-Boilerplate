import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PageDto, PageMetaDto, PageOptionsDto } from 'src/common/dtos/pages';
import { ILike, Repository } from 'typeorm';
import { TokenService } from '../../token/token.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { QueryUserDto } from '../dtos/query-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly tokenService: TokenService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    await this.isEmailUnique(createUserDto.email);
    return await this.userRepository.save(createUserDto);
  }

  async findAll(
    queryUserDto: QueryUserDto,
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<User>> {
    const query: any = {};

    if (queryUserDto.name) {
      query.name = ILike(`%${queryUserDto.name}%`);
    }

    if (queryUserDto.email) {
      query.email = ILike(`%${queryUserDto.email}%`);
    }

    if (queryUserDto.role) {
      query.role = queryUserDto.role;
    }

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    queryBuilder
      .select([
        'user.id',
        'user.name',
        'user.email',
        'user.role',
        'user.avatar',
        'user.createdAt',
      ])
      .where(query)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PageDto(entities, pageMetaDto);
  }

  async findOne(id: number): Promise<User> {
    const data = await this.userRepository.findOneBy({ id });

    if (!data) {
      throw new NotFoundException(['user not found']);
    }
    return data;
  }

  async findOneBy(key: string, value: string): Promise<User> {
    return await this.userRepository.findOneBy({ [key]: value });
  }

  async updateById(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const getUser = await this.findOne(id);
    if (!getUser) {
      throw new NotFoundException(['user not found']);
    }

    if (updateUserDto.email && updateUserDto.email !== getUser.email) {
      await this.isEmailUnique(updateUserDto.email);
    }

    return await this.userRepository.save({ ...getUser, ...updateUserDto });
  }

  async updatePassword(userId: number, password: string): Promise<User> {
    const user = await this.findOne(userId);

    if (!user) {
      throw new NotFoundException(['user not found']);
    }

    this.tokenService.deleteAllUserTokens(userId);
    user.password = password;
    return await this.userRepository.save(user);
  }

  async remove(id: number): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(['user not found']);
    }

    return await this.userRepository.remove(user);
  }

  private async isEmailUnique(email: string): Promise<boolean> {
    const user = await this.userRepository.findOneBy({ email });
    if (user) {
      throw new BadRequestException(['email already taken']);
    }

    return true;
  }
}
