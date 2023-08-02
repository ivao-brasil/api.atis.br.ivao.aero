import { Test, TestingModule } from '@nestjs/testing';
import { RunwayParamsController } from './runway-params.controller';
import { RunwayParamsService } from './runway-params.service';

describe('RunwayParamsController', () => {
  let controller: RunwayParamsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RunwayParamsController],
      providers: [RunwayParamsService],
    }).compile();

    controller = module.get<RunwayParamsController>(RunwayParamsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
