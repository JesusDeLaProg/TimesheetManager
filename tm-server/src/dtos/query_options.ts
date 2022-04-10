import { IQueryOptions } from '@tm/types/query_options';
import { IsInt, IsArray, Min } from 'class-validator';

export class QueryOptions implements IQueryOptions {
    @IsArray({ each: true })
    sort?: string[];

    @IsInt()
    @Min(0)
    limit?: number;

    @IsInt()
    @Min(0)
    skip?: number;
}