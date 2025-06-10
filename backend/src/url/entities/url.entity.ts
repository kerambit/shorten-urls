import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { UrlClick } from './url-click.entity';

@Entity()
export class Url {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  originalUrl: string;

  @Column({ unique: true })
  shortUrl: string;

  @Column({ nullable: true, length: 20 })
  alias: string;

  @Column({ nullable: true })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => UrlClick, (click) => click.url)
  clicks: UrlClick[];
}
