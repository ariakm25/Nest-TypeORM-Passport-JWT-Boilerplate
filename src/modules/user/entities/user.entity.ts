import {
  AfterLoad,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Factory } from 'nestjs-seeder';
import { Role } from '../enums/role.enum';
import { Token } from 'src/modules/token/entities/token.entity';
import { Exclude } from 'class-transformer';
import { hashSync } from 'bcryptjs';
import { ApiHideProperty } from '@nestjs/swagger';

@Entity()
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Factory((faker) => faker.name.findName())
  @Column({ length: 255 })
  name: string;

  @Factory((faker) => faker.internet.email())
  @Column({ length: 255, unique: true })
  email: string;

  @Factory('$2a$10$gKLiOrts6gyxa92zITbkBObiGQ8.xYrlD/EZwE6wzdHNgN61BOK8u') // password
  @Column({ length: 255 })
  @Exclude()
  password: string;

  @Factory((faker) => faker.image.avatar())
  @Column({ length: 255 })
  avatar: string;

  @Column({ type: 'enum', enum: [Role.USER, Role.ADMIN], default: Role.USER })
  role: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => Token, (token) => token.user)
  @ApiHideProperty()
  tokens?: Token[];

  @Exclude()
  @ApiHideProperty()
  private tempPassword?: string;

  @AfterLoad()
  private loadTempPassword(): void {
    this.tempPassword = this.password;
  }

  @BeforeUpdate()
  private hashPassword(): void {
    if (this.tempPassword !== this.password) {
      this.password = hashSync(this.password, 10);
    }
  }
}
