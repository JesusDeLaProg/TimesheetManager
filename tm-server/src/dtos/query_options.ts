import { IQueryOptions } from '@tm/types/query_options';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsArray,
  Min,
  IsOptional,
  IsString,
  IsIn,
  ValidateNested,
} from 'class-validator';

class SortOption {
  @IsString()
  field: string;

  @IsString()
  @IsIn(['asc', 'desc'])
  direction: 'asc' | 'desc';
}

export class QueryOptions implements IQueryOptions {
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SortOption)
  sort?: SortOption[];

  @IsInt()
  @Min(0)
  @IsOptional()
  limit?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  skip?: number;
}
