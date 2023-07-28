import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';
import { QueryOptions } from '../dtos/query_options';
import { plainToInstance } from 'class-transformer';
import { IQueryOptions } from '@tm/types/query_options';
import { validateSync } from 'class-validator';

export const QueryOpts = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): QueryOptions | null => {
    const query = ctx.switchToHttp().getRequest<Request>().query;
    if (query.limit === undefined && query.skip === undefined && query.sort === undefined) {
      return null;
    }
    const qo = plainToInstance(QueryOptions, {
      limit: Number(query.limit),
      skip: Number(query.skip),
      sort: query.sort,
    } as IQueryOptions);
    const validationErrors = validateSync(qo);
    if (validationErrors.length > 0) {
      throw new BadRequestException(
        validationErrors.map((e) => e.toString()).join('\n'),
      );
    }
    return qo;
  },
);
