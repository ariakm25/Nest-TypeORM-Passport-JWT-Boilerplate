import { User } from '../../user/entities/user.entity';
import { TokenType } from 'src/common/enums/token-type.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Token {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  token: string;

  @Column({
    type: 'enum',
    enum: [
      TokenType.RefreshToken,
      TokenType.ConfirmEmail,
      TokenType.ResetPassword,
    ],
  })
  type: string;

  @Column({ type: 'timestamp', nullable: true })
  expires: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.id, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;
}
