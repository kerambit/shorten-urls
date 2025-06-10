import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Url } from './entities/url.entity';
import { UrlClick } from './entities/url-click.entity';
import { CreateUrlDto } from './dto/create-url.dto';
import { v4 as uuidv4 } from 'uuid';

export type AnalyticsInfo = {
  clickCount: number;
  lastIps: string[];
};

export type UrlInfo = {
  originalUrl: string;
  createdAt: Date;
  clickCount: number;
};

@Injectable()
export class UrlService {
  constructor(
    @InjectRepository(Url)
    private urlRepository: Repository<Url>,
    @InjectRepository(UrlClick)
    private urlClickRepository: Repository<UrlClick>,
  ) {}

  public async create(createUrlDto: CreateUrlDto): Promise<Url> {
    const shortUrl = createUrlDto.alias || this.generateShortUrl();

    const url = this.urlRepository.create({
      originalUrl: createUrlDto.originalUrl,
      shortUrl,
      alias: createUrlDto.alias,
      expiresAt: createUrlDto.expiresAt,
    });

    return this.urlRepository.save(url);
  }

  public async findByShortUrl(shortUrl: string): Promise<Url> {
    const url = await this.urlRepository.findOne({ where: { shortUrl } });
    if (!url) {
      throw new NotFoundException('URL not found');
    }

    return url;
  }

  public async getUrlInfo(shortUrl: string): Promise<UrlInfo> {
    const url = await this.findByShortUrl(shortUrl);
    const clickCount = await this.urlClickRepository.count({
      where: { url: { id: url.id } },
    });

    return {
      originalUrl: url.originalUrl,
      createdAt: url.createdAt,
      clickCount,
    };
  }

  public async delete(shortUrl: string): Promise<void> {
    const url = await this.findByShortUrl(shortUrl);
    await this.urlRepository.remove(url);
  }

  public async recordClick(url: Url, ipAddress: string): Promise<void> {
    const click = this.urlClickRepository.create({
      url,
      ipAddress,
    });

    await this.urlClickRepository.save(click);
  }

  public async getAnalytics(shortUrl: string): Promise<AnalyticsInfo> {
    const url = await this.findByShortUrl(shortUrl);
    const clickCount = await this.urlClickRepository.count({
      where: { url: { id: url.id } },
    });

    const recentClicks = await this.urlClickRepository.find({
      where: { url: { id: url.id } },
      order: { clickedAt: 'DESC' },
      take: 5,
    });

    return {
      clickCount,
      lastIps: recentClicks.map((click) => click.ipAddress),
    };
  }

  private generateShortUrl(): string {
    return uuidv4().substring(0, 8);
  }
}
