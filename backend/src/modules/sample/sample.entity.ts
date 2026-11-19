import { BaseEntity } from '../../shared/base-entity';

export interface SampleEntityProps {
  id: string;
  title: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class SampleEntity extends BaseEntity {
  public readonly title: string;
  public readonly description: string | null;

  constructor(props: SampleEntityProps) {
    super({
      id: props.id,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
    this.title = props.title;
    this.description = props.description ?? null;
  }
}
