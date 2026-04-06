import { ObjectType, Field, Int } from '@nestjs/graphql';
import { AuditTimestampModel } from './audit.model';
import { GraphQLBigInt } from 'graphql-scalars';

@ObjectType()
export class User extends AuditTimestampModel {
  @Field(() => GraphQLBigInt)
  id?: number;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phoneNumber?: string;

  @Field({ nullable: true })
  emailVerified?: boolean;

  @Field({ nullable: true })
  phoneVerified?: boolean;

  @Field({ nullable: true })
  twoFactorEnabled?: boolean;

  @Field({ nullable: true })
  isActive?: boolean;

  @Field(() => [String], { nullable: true })
  roles?: string[];

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;
}