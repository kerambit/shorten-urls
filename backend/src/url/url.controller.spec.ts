import { Test, TestingModule } from '@nestjs/testing';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { Response, Request } from 'express';
import { NotFoundException } from '@nestjs/common';

describe('UrlController', () => {
  let controller: UrlController;
  let service: UrlService;

  const mockUrlService = {
    create: jest.fn(),
    findByShortUrl: jest.fn(),
    recordClick: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlController],
      providers: [
        {
          provide: UrlService,
          useValue: mockUrlService,
        },
      ],
    }).compile();

    controller = module.get<UrlController>(UrlController);
    service = module.get<UrlService>(UrlService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new short URL', async () => {
      const createUrlDto = {
        originalUrl: 'https://example.com',
        alias: 'test-alias',
      } satisfies CreateUrlDto;

      const expectedResponse = {
        shortUrl: 'test-alias',
        originalUrl: 'https://example.com',
        expiresAt: null,
      };

      mockUrlService.create.mockResolvedValue(expectedResponse);

      const result = await controller.create(createUrlDto);

      expect(result).toEqual(expectedResponse);
      expect(mockUrlService.create).toHaveBeenCalledWith(createUrlDto);
    });

    it('should create a short URL without alias', async () => {
      const createUrlDto = {
        originalUrl: 'https://example.com',
      } satisfies CreateUrlDto;

      const expectedResponse = {
        shortUrl: 'generated-short',
        originalUrl: 'https://example.com',
        expiresAt: null,
      };

      mockUrlService.create.mockResolvedValue(expectedResponse);

      const result = await controller.create(createUrlDto);

      expect(result).toEqual(expectedResponse);
      expect(mockUrlService.create).toHaveBeenCalledWith(createUrlDto);
    });
  });

  describe('redirect', () => {
    const createMockRequest = (ip: string): Partial<Request> => ({
      ip,
      headers: {},
      method: 'GET',
      url: '/',
      params: {},
      query: {},
      body: {},
      get: jest.fn(),
      header: jest.fn(),
      accepts: jest.fn(),
      acceptsCharsets: jest.fn(),
      acceptsEncodings: jest.fn(),
      acceptsLanguages: jest.fn(),
      is: jest.fn(),
      protocol: 'http',
      secure: false,
      subdomains: [],
      path: '/',
      hostname: 'localhost',
      host: 'localhost:3000',
      fresh: false,
      stale: true,
      xhr: false,
      cookies: {},
      signedCookies: {},
    });

    it('should redirect to original URL', async () => {
      const shortUrl = 'test-alias';
      const mockResponse = {
        redirect: jest.fn(),
      } as unknown as Response;

      const mockRequest = createMockRequest('127.0.0.1') as Request;

      const mockUrl = {
        originalUrl: 'https://example.com',
      };

      mockUrlService.findByShortUrl.mockResolvedValue(mockUrl);
      mockUrlService.recordClick.mockResolvedValue(undefined);

      await controller.redirect(shortUrl, mockResponse, mockRequest);

      expect(mockUrlService.findByShortUrl).toHaveBeenCalledWith(shortUrl);
      expect(mockUrlService.recordClick).toHaveBeenCalledWith(
        mockUrl,
        mockRequest.ip,
      );
      expect(mockResponse.redirect).toHaveBeenCalledWith(mockUrl.originalUrl);
    });

    it('should handle non-existent short URL', async () => {
      const shortUrl = 'non-existent';
      const mockResponse = {
        redirect: jest.fn(),
      } as unknown as Response;

      const mockRequest = createMockRequest('127.0.0.1') as Request;

      mockUrlService.findByShortUrl.mockRejectedValue(
        new NotFoundException('URL not found'),
      );

      await expect(
        controller.redirect(shortUrl, mockResponse, mockRequest),
      ).rejects.toThrow(NotFoundException);
      expect(mockResponse.redirect).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const shortUrl = 'test-alias';
      const mockResponse = {
        redirect: jest.fn(),
      } as unknown as Response;

      const mockRequest = createMockRequest('127.0.0.1') as Request;

      mockUrlService.findByShortUrl.mockRejectedValue(
        new Error('Service error'),
      );

      await expect(
        controller.redirect(shortUrl, mockResponse, mockRequest),
      ).rejects.toThrow('Service error');
      expect(mockResponse.redirect).not.toHaveBeenCalled();
    });
  });
});
