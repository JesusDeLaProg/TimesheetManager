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
  (data: unknown, ctx: ExecutionContext): QueryOptions => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const qo = plainToInstance(QueryOptions, {
      limit: Number(request.query.limit),
      skip: Number(request.query.skip),
      sort: request.query.sort,
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
