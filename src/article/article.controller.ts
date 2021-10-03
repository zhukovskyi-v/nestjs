import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { AuthGuard } from '../user/guards/auth.guard';
import { User } from '../user/decorators/user.decorators';
import { UserEntity } from '../user/user.entity';
import { CreateArticleDto } from './dto/createArticle.dto';
import { ArticleResponseInterface } from './types/articleResponse.interface';
import { UpdateArticleDto } from './dto/updateArticle.dto';
import { ArticlesResponseInterface } from './types/articlesResponse.interface';
import { BackendValidationPipe } from '../shared/pipes/backend.validation.pipe';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  async findAll(
    @User('id') userId: number,
    @Query() query: any,
  ): Promise<ArticlesResponseInterface> {
    return await this.articleService.findAll(userId, query);
  }

  @Post(':slug/favorite')
  @UseGuards(AuthGuard)
  async likeArticle(@User('id') userId: number, @Param('slug') slug: string) {
    const article = this.articleService.likeArticle(userId, slug);
    return this.articleService.buildArticleResponse(await article);
  }

  @Delete(':slug/favorite')
  @UseGuards(AuthGuard)
  async unlikeArticle(@User('id') userId: number, @Param('slug') slug: string) {
    const article = this.articleService.unlikeArticle(userId, slug);
    return this.articleService.buildArticleResponse(await article);
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @User() user: UserEntity,
    @Body('article') createArticleDto: CreateArticleDto,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.createArticle(
      user,
      createArticleDto,
    );
    return this.articleService.buildArticleResponse(article);
  }

  @Get(':slug')
  async getArticle(
    @Param('slug') slug: string,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.getArticleBySlug(slug);
    return this.articleService.buildArticleResponse(article);
  }

  @Put(':slug')
  @UseGuards(AuthGuard)
  async updateArticle(
    @User('id') userId: number,
    @Body('article') updateArticleDto: UpdateArticleDto,
    @Param('slug') slug: string,
  ): Promise<ArticleResponseInterface> {
    const updatedArticle = await this.articleService.updateArticle(
      userId,
      updateArticleDto,
      slug,
    );
    return this.articleService.buildArticleResponse(updatedArticle);
  }

  @Delete(':slug')
  @UseGuards(AuthGuard)
  async deleteArticle(@User('id') userId: number, @Param('slug') slug: string) {
    return this.articleService.deleteArticle(userId, slug);
  }
}
