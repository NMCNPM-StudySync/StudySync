import { BaseEntity } from '../../shared/base-entity';

export interface UserEntityProps {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserEntity extends BaseEntity {
  public readonly email: string;
  public readonly passwordHash: string;
  public readonly displayName: string;

  constructor(props: UserEntityProps) {
    super({ id: props.id, createdAt: props.createdAt, updatedAt: props.updatedAt });
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.displayName = props.displayName;
  }
}

/** Dạng người dùng trả ra API: tuyệt đối không chứa passwordHash. */
export interface PublicUser {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
}

export function toPublicUser(user: UserEntity): PublicUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    createdAt: user.createdAt.toISOString(),
  };
}
