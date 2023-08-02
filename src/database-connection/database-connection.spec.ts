import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseConnection } from './database-connection';

describe('DatabaseConnection', () => {
  let provider: DatabaseConnection;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatabaseConnection],
    }).compile();

    provider = module.get<DatabaseConnection>(DatabaseConnection);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
