import {
  listEntity,
  filterEntity,
  createEntity,
  bulkCreateEntity,
  updateEntity,
  deleteEntity,
  EntityName,
} from '@/lib/db-operations';
import db from '@/db';

// Mock the database
jest.mock('@/db', () => ({
  __esModule: true,
  default: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('DB Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listEntity', () => {
    it('should list all entities', async () => {
      const mockData = [
        { id: 1, name: 'Test User', email: 'test@test.com' },
        { id: 2, name: 'Test User 2', email: 'test2@test.com' },
      ];

      const mockQuery = {
        from: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockData),
      };

      (db.select as jest.Mock).mockReturnValue(mockQuery);

      const result = await listEntity('User' as EntityName);

      expect(db.select).toHaveBeenCalled();
      expect(mockQuery.from).toHaveBeenCalled();
    });

    it('should list entities with sorting', async () => {
      const mockData = [{ id: 1, name: 'Test' }];
      const mockQuery = {
        from: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockData),
      };

      (db.select as jest.Mock).mockReturnValue(mockQuery);

      await listEntity('User' as EntityName, 'name');

      expect(mockQuery.orderBy).toHaveBeenCalled();
    });

    it('should list entities with limit', async () => {
      const mockData = [{ id: 1, name: 'Test' }];
      const mockQuery = {
        from: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockData),
      };

      (db.select as jest.Mock).mockReturnValue(mockQuery);

      await listEntity('User' as EntityName, undefined, 10);

      expect(mockQuery.limit).toHaveBeenCalledWith(10);
    });
  });

  describe('filterEntity', () => {
    it('should filter entities by query', async () => {
      const mockData = [{ id: 1, email: 'test@test.com' }];
      const mockQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockData),
      };

      (db.select as jest.Mock).mockReturnValue(mockQuery);

      const result = await filterEntity('User' as EntityName, { email: 'test@test.com' });

      expect(mockQuery.where).toHaveBeenCalled();
    });

    it('should handle complex filter queries with operators', async () => {
      const mockData = [{ id: 1, age: 25 }];
      const mockQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockData),
      };

      (db.select as jest.Mock).mockReturnValue(mockQuery);

      await filterEntity('User' as EntityName, { age: { $gt: 18 } });

      expect(mockQuery.where).toHaveBeenCalled();
    });
  });

  describe('createEntity', () => {
    it('should create a new entity', async () => {
      const mockData = { id: 1, name: 'Test', email: 'test@test.com' };
      const mockInsert = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockData]),
      };

      (db.insert as jest.Mock).mockReturnValue(mockInsert);

      const newData = { name: 'Test', email: 'test@test.com' };
      const result = await createEntity('User' as EntityName, newData);

      expect(db.insert).toHaveBeenCalled();
      expect(mockInsert.values).toHaveBeenCalled();
      expect(mockInsert.returning).toHaveBeenCalled();
    });

    it('should exclude id and timestamps from creation', async () => {
      const mockData = { id: 1, name: 'Test' };
      const mockInsert = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockData]),
      };

      (db.insert as jest.Mock).mockReturnValue(mockInsert);

      const newData = {
        id: 999, // Should be excluded
        name: 'Test',
        created_at: new Date(), // Should be excluded
        updated_at: new Date(), // Should be excluded
      };

      await createEntity('User' as EntityName, newData);

      expect(mockInsert.values).toHaveBeenCalled();
      const calledWith = mockInsert.values.mock.calls[0][0];
      expect(calledWith).not.toHaveProperty('id');
      expect(calledWith).not.toHaveProperty('created_at');
      expect(calledWith).not.toHaveProperty('updated_at');
    });
  });

  describe('bulkCreateEntity', () => {
    it('should create multiple entities at once', async () => {
      const mockData = [
        { id: 1, name: 'Test1' },
        { id: 2, name: 'Test2' },
      ];
      const mockInsert = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue(mockData),
      };

      (db.insert as jest.Mock).mockReturnValue(mockInsert);

      const newDataArray = [{ name: 'Test1' }, { name: 'Test2' }];
      const result = await bulkCreateEntity('User' as EntityName, newDataArray);

      expect(db.insert).toHaveBeenCalled();
      expect(mockInsert.values).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });
  });

  describe('updateEntity', () => {
    it('should update an entity by id', async () => {
      const mockData = { id: 1, name: 'Updated', email: 'updated@test.com' };
      const mockUpdate = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockData]),
      };

      (db.update as jest.Mock).mockReturnValue(mockUpdate);

      const updateData = { name: 'Updated', email: 'updated@test.com' };
      const result = await updateEntity('User' as EntityName, 1, updateData);

      expect(db.update).toHaveBeenCalled();
      expect(mockUpdate.set).toHaveBeenCalled();
      expect(mockUpdate.where).toHaveBeenCalled();
    });

    it('should throw error if entity not found', async () => {
      const mockUpdate = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([]),
      };

      (db.update as jest.Mock).mockReturnValue(mockUpdate);

      await expect(updateEntity('User' as EntityName, 999, { name: 'Test' })).rejects.toThrow(
        'User with id 999 not found'
      );
    });
  });

  describe('deleteEntity', () => {
    it('should delete an entity by id', async () => {
      const mockDelete = {
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{ id: 1 }]),
      };

      (db.delete as jest.Mock).mockReturnValue(mockDelete);

      await deleteEntity('User' as EntityName, 1);

      expect(db.delete).toHaveBeenCalled();
      expect(mockDelete.where).toHaveBeenCalled();
    });

    it('should throw error if entity not found on delete', async () => {
      const mockDelete = {
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([]),
      };

      (db.delete as jest.Mock).mockReturnValue(mockDelete);

      await expect(deleteEntity('User' as EntityName, 999)).rejects.toThrow(
        'User with id 999 not found'
      );
    });
  });
});

