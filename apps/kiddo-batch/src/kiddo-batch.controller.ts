import { Controller, Get } from '@nestjs/common';
import { KiddoBatchService } from './kiddo-batch.service';

@Controller()
export class KiddoBatchController {
  constructor(private readonly kiddoBatchService: KiddoBatchService) {}

  @Get()
  getHello(): string {
    return this.kiddoBatchService.getHello();
  }
}
