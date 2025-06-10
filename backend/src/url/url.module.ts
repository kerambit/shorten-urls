import { Module } from '@nestjs/common';
import { UrlService } from './url.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UrlController } from './url.controller';
import { Url } from './entities/url.entity';
import { UrlClick } from './entities/url-click.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Url, UrlClick])],
  controllers: [UrlController],
  providers: [UrlService],
})
export class UrlModule {}
