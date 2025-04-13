import { Deploy } from './deploy';

export interface DeployRepository {
  save(deploy: Deploy): Promise<void>;
  findById(id: string): Promise<Deploy | null>;
  findByProjectId(projectId: string): Promise<Deploy[]>;
  update(deploy: Deploy): Promise<void>;
  delete(id: string): Promise<void>;
} 