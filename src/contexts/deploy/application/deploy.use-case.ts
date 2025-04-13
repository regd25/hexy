import { Injectable } from '@nestjs/common';
import { Deploy, DeployStatus } from '../domain/deploy';
import { DeployRepository } from '../domain/deploy-repository';

export interface CreateDeployCommand {
  projectId: string;
  environment: string;
}

@Injectable()
export class DeployUseCase {
  constructor(private readonly deployRepository: DeployRepository) {}

  async createDeploy(command: CreateDeployCommand): Promise<Deploy> {
    const deploy = Deploy.create({
      ...command,
      status: DeployStatus.PENDING,
    });
    
    await this.deployRepository.save(deploy);
    return deploy;
  }

  async getDeployById(id: string): Promise<Deploy | null> {
    return this.deployRepository.findById(id);
  }

  async getDeploysByProjectId(projectId: string): Promise<Deploy[]> {
    return this.deployRepository.findByProjectId(projectId);
  }

  async updateDeploy(deploy: Deploy): Promise<void> {
    await this.deployRepository.update(deploy);
  }

  async deleteDeploy(id: string): Promise<void> {
    await this.deployRepository.delete(id);
  }
} 