import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Seeder, DataFactory } from 'nestjs-seeder';
import { User } from '../../modules/user/entities/user.entity';
import { Repository } from 'typeorm';
import { Role } from 'src/modules/user/enums/role.enum';

@Injectable()
export class UsersSeeder implements Seeder {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async seed(): Promise<any> {
    const users = DataFactory.createForClass(User).generate(50);

    await this.userRepository.upsert(
      {
        name: 'Admin',
        email: 'admin@admin.com',
        password:
          '$2a$10$gKLiOrts6gyxa92zITbkBObiGQ8.xYrlD/EZwE6wzdHNgN61BOK8u', // password
        avatar: 'https://avatars.githubusercontent.com/u/45255650?v=4',
        role: Role.ADMIN,
      },
      {
        conflictPaths: ['email'],
      },
    );

    return this.userRepository.insert(users);
  }

  async drop(): Promise<any> {
    return this.userRepository.clear();
  }
}
