import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Url } from './url.entity';

@Entity()
export class UrlClick {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Url, (url) => url.clicks, {
    onDelete: 'CASCADE',
  })
  url: Url;

  @Column()
  ipAddress: string;

  @CreateDateColumn()
  clickedAt: Date;
}
