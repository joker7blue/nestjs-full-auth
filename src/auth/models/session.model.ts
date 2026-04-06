import { ApiProperty } from '@nestjs/swagger';

export class Session {
  @ApiProperty({ description: 'Session ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Device ID', example: 'device-123' })
  deviceId: string;

  @ApiProperty({ description: 'IP Address', example: '192.168.1.1' })
  ipAddress: string;

  @ApiProperty({ description: 'Country', example: 'United States', nullable: true })
  country?: string;

  @ApiProperty({ description: 'Region', example: 'California', nullable: true })
  region?: string;

  @ApiProperty({ description: 'City', example: 'San Francisco', nullable: true })
  city?: string;

  @ApiProperty({ description: 'Timezone', example: 'America/Los_Angeles', nullable: true })
  timezone?: string;

  @ApiProperty({ description: 'User Agent string', example: 'Mozilla/5.0...' })
  userAgent: string;

  @ApiProperty({ description: 'Operating System', example: 'Windows', nullable: true })
  os?: string;

  @ApiProperty({ description: 'Browser name', example: 'Chrome', nullable: true })
  browser?: string;

  @ApiProperty({ description: 'Device model', example: 'iPhone 12', nullable: true })
  device?: string;

  @ApiProperty({ description: 'Session creation date', example: '2023-10-01T10:00:00Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Session expiration date', example: '2023-11-01T10:00:00Z' })
  expiresAt: Date;
}
