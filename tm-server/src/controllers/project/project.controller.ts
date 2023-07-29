import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ProjectService } from '//services/project/project.service';
import { AuthenticatedUser } from '//decorators/user.decorator';
import { User } from '//dtos/user';
import { QueryOptions } from '//dtos/query_options';
import { QueryOpts } from '//decorators/query_options.decorator';

@Controller('project')
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  @Get('list')
  async get(
    @AuthenticatedUser() user: User,
    @QueryOpts() queryOptions?: QueryOptions,
  ) {
    return this.projectService.get(user, queryOptions);
  }

  @Get('getbyid/:id')
  async getById(@AuthenticatedUser() user: User, @Param('id') id: string) {
    return this.projectService.getById(user, id);
  }

  @Post('create')
  async create(@AuthenticatedUser() user: User, @Body() project: any) {
    return this.projectService.create(user, project);
  }

  @Get('update')
  async update(@AuthenticatedUser() user: User, @Body() project: any) {
    return this.projectService.update(user, project);
  }

  @Get('validate')
  async validate(@Body() project: any) {
    return this.projectService.validate(project);
  }

  @Get('search')
  async searchByCodePrefix(
    @AuthenticatedUser() user: User,
    @Query('q') prefix: string,
    @QueryOpts() queryOptions?: QueryOptions,
  ) {
    return this.projectService.searchByCodePrefix(user, prefix, queryOptions);
  }
}
