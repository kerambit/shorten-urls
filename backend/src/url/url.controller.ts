import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Res,
  Req,
  Logger,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { UrlService } from './url.service';
import { CreateUrlDto } from './dto/create-url.dto';
import type { AnalyticsInfo, UrlInfo } from './url.service';
import { QueryFailedError } from 'typeorm';

@Controller()
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post('shorten')
  public async create(@Body() createUrlDto: CreateUrlDto): Promise<{
    shortUrl: string;
    originalUrl: string;
    expiresAt: Date;
  }> {
    try {
      const url = await this.urlService.create(createUrlDto);

      return {
        shortUrl: url.shortUrl,
        originalUrl: url.originalUrl,
        expiresAt: url.expiresAt,
      };
    } catch (e) {
      Logger.error(e);
      if (
        e instanceof QueryFailedError &&
        e.message.includes('duplicate key')
      ) {
        throw new ConflictException('Alias is already exists');
      }

      throw new InternalServerErrorException('Something went wrong');
    }
  }

  @Get(':shortUrl')
  public async redirect(
    @Param('shortUrl') shortUrl: string,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    const url = await this.urlService.findByShortUrl(shortUrl);
    await this.urlService.recordClick(url, <string>req.ip);

    return res.redirect(url.originalUrl);
  }

  @Get('info/:shortUrl')
  public async getUrlInfo(
    @Param('shortUrl') shortUrl: string,
  ): Promise<UrlInfo> {
    return this.urlService.getUrlInfo(shortUrl);
  }

  @Delete('delete/:shortUrl')
  public async delete(@Param('shortUrl') shortUrl: string): Promise<{
    message: string;
  }> {
    await this.urlService.delete(shortUrl);
    return { message: 'URL deleted successfully' };
  }

  @Get('analytics/:shortUrl')
  public async getAnalytics(
    @Param('shortUrl') shortUrl: string,
  ): Promise<AnalyticsInfo> {
    return this.urlService.getAnalytics(shortUrl);
  }
}
