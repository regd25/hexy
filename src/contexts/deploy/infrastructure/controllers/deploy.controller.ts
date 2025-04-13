import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { DeployUseCase, CreateDeployCommand } from '../../application/deploy.use-case';
import { Deploy } from '../../domain/deploy';

@Controller('deploys')
export class DeployController {
  constructor(private readonly deployUseCase: DeployUseCase) {}

  @Post()
  async createDeploy(@Body() command: CreateDeployCommand): Promise<Deploy> {
    return this.deployUseCase.createDeploy(command);
  }

  @Get(':id')
  async getDeployById(@Param('id') id: string): Promise<Deploy | null> {
    return this.deployUseCase.getDeployById(id);
  }

  @Get('project/:projectId')
  async getDeploysByProjectId(@Param('projectId') projectId: string): Promise<Deploy[]> {
    return this.deployUseCase.getDeploysByProjectId(projectId);
  }

  @Put(':id')
  async updateDeploy(@Param('id') id: string, @Body() deploy: Deploy): Promise<void> {
    await this.deployUseCase.updateDeploy(deploy);
  }

  @Delete(':id')
  async deleteDeploy(@Param('id') id: string): Promise<void> {
    await this.deployUseCase.deleteDeploy(id);
  }
} 