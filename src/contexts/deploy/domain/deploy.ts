import { AggregateRoot } from '@nestjs/cqrs';

export interface DeployProps {
  id: string;
  projectId: string;
  environment: string;
  status: DeployStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum DeployStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export class Deploy extends AggregateRoot {
  private readonly props: DeployProps;

  private constructor(props: DeployProps) {
    super();
    this.props = props;
  }

  public static create(props: Omit<DeployProps, 'id' | 'createdAt' | 'updatedAt'>): Deploy {
    const deploy = new Deploy({
      ...props,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return deploy;
  }

  public get id(): string {
    return this.props.id;
  }

  public get projectId(): string {
    return this.props.projectId;
  }

  public get environment(): string {
    return this.props.environment;
  }

  public get status(): DeployStatus {
    return this.props.status;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get updatedAt(): Date {
    return this.props.updatedAt;
  }
} 