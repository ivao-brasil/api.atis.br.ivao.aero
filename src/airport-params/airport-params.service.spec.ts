import { Test, TestingModule } from '@nestjs/testing';
import { AirportParamsService } from './airport-params.service';

describe('AirportParamsService', () => {
  let service: AirportParamsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AirportParamsService],
    }).compile();

    service = module.get<AirportParamsService>(AirportParamsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
