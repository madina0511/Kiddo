import { Injectable } from '@nestjs/common';

@Injectable()
export class KiddoBatchService {
  getHello(): string {
    return 'Hello Kiddo Batch server';
  }
}
