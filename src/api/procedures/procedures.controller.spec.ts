import { Test, TestingModule } from '@nestjs/testing';
import { ProceduresController } from './procedures.controller';

describe('ProceduresController', () => {
  let controller: ProceduresController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProceduresController],
    }).compile();

    controller = module.get<ProceduresController>(ProceduresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
