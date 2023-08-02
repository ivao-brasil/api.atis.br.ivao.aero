import { Test, TestingModule } from '@nestjs/testing';
import { RunwayParamsService } from './runway-params.service';

describe('RunwayParamsService', () => {
  let service: RunwayParamsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RunwayParamsService],
    }).compile();

    service = module.get<RunwayParamsService>(RunwayParamsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
