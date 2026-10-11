import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller()
export class AppController {
  constructor(private readonly dataSource: DataSource) { }

  @Get('health')
  async health() {
    const [row] = await this.dataSource.query('SELECT now() AS server_time');
    return { status: 'ok', db: 'connected', serverTime: row.server_time };
  }
}