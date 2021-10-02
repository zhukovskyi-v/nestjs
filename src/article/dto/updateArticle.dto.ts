import { IsOptional } from 'class-validator';

export class UpdateArticleDto {
  @IsOptional()
  private readonly title: string;

  @IsOptional()
  private readonly body: string;

  @IsOptional()
  private readonly description: string;
}
