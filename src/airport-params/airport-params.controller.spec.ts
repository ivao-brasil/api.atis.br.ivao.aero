import { Test, TestingModule } from '@nestjs/testing';
import { AirportParamsController } from './airport-params.controller';

describe('AirportParamsController', () => {
  let controller: AirportParamsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AirportParamsController],
    }).compile();

    controller = module.get<AirportParamsController>(AirportParamsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
