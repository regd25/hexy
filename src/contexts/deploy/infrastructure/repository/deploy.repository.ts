import { Injectable } from '@nestjs/common';
import { Deploy } from '../../domain/deploy';
import { DeployRepository } from '../../domain/deploy-repository';

@Injectable()
export class DeployRepositoryImpl implements DeployRepository {
  private deploys: Deploy[] = [];

  async save(deploy: Deploy): Promise<void> {
    this.deploys.push(deploy);
  }

  async findById(id: string): Promise<Deploy | null> {
    return this.deploys.find(deploy => deploy.id === id) || null;
  }

  async findByProjectId(projectId: string): Promise<Deploy[]> {
    return this.deploys.filter(deploy => deploy.projectId === projectId);
  }

  async update(deploy: Deploy): Promise<void> {
    const index = this.deploys.findIndex(d => d.id === deploy.id);
    if (index !== -1) {
      this.deploys[index] = deploy;
    }
  }

  async delete(id: string): Promise<void> {
    this.deploys = this.deploys.filter(deploy => deploy.id !== id);
  }
} 