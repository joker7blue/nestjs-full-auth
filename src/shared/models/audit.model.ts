import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

@ObjectType()
export class AuditTimestampModel {
  @ApiProperty()
  @Field()
  createdAt: Date;

  @ApiProperty()
  @Field()
  updatedAt: Date;

  @ApiProperty({ nullable: true })
  @Field({ nullable: true })
  deletedAt?: Date;

  @ApiProperty({ nullable: true })
  @Field({ nullable: true })
  archivedAt?: Date;
}
