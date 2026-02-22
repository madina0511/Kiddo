import { Test, TestingModule } from '@nestjs/testing';
import { KiddoBatchController } from './kiddo-batch.controller';
import { KiddoBatchService } from './kiddo-batch.service';

describe('KiddoBatchController', () => {
  let kiddoBatchController: KiddoBatchController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [KiddoBatchController],
      providers: [KiddoBatchService],
    }).compile();

    kiddoBatchController = app.get<KiddoBatchController>(KiddoBatchController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(kiddoBatchController.getHello()).toBe('Hello World!');
    });
  });
});
