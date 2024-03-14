import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PhaseService } from '//services/phase/phase.service';
import { AuthenticatedUser } from '//decorators/user.decorator';
import { QueryOpts } from '//decorators/query_options.decorator';
import { User } from '//dtos/user';
import { QueryOptions } from '//dtos/query_options';

@Controller('phase')
export class PhaseController {
  constructor(private phaseService: PhaseService) {}

  @Get('list')
  async get(
    @AuthenticatedUser() user: User,
    @QueryOpts() queryOptions?: QueryOptions,
  ) {
    return this.phaseService.get(user, queryOptions);
  }

  @Get('getbyid/:id')
  async getById(@AuthenticatedUser() user: User, @Param('id') id: string) {
    return this.phaseService.getById(user, id);
  }

  @Post('create')
  async create(@AuthenticatedUser() user: User, @Body() phase: any) {
    return this.phaseService.create(user, phase);
  }

  @Post('update')
  async update(@AuthenticatedUser() user: User, @Body() phase: any) {
    return this.phaseService.update(user, phase);
  }

  @Post('validate')
  async validate(@Body() phase: any) {
    return this.phaseService.validate(phase);
  }
}
