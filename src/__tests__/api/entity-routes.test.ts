import { NextRequest, NextResponse } from 'next/server';
import { GET, POST, PUT, DELETE } from '@/app/api/entities/[entity]/route';

// Mock the db-operations module
jest.mock('@/lib/db-operations', () => ({
  listEntity: jest.fn(),
  filterEntity: jest.fn(),
  createEntity: jest.fn(),
  bulkCreateEntity: jest.fn(),
  updateEntity: jest.fn(),
  deleteEntity: jest.fn(),
}));

import * as dbOps from '@/lib/db-operations';

describe('Entity API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/entities/[entity]', () => {
    it('should list entities', async () => {
      const mockData = [{ id: 1, name: 'Test' }];
      (dbOps.listEntity as jest.Mock).mockResolvedValue(mockData);

      const request = new NextRequest('http://localhost:3000/api/entities/User');
      const params = Promise.resolve({ entity: 'User' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockData);
      expect(dbOps.listEntity).toHaveBeenCalledWith('User', undefined, undefined);
    });

    it('should filter entities with query params', async () => {
      const mockData = [{ id: 1, email: 'test@test.com' }];
      (dbOps.filterEntity as jest.Mock).mockResolvedValue(mockData);

      const filterQuery = { email: 'test@test.com' };
      const request = new NextRequest(
        `http://localhost:3000/api/entities/User?filter=${JSON.stringify(filterQuery)}`
      );
      const params = Promise.resolve({ entity: 'User' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(dbOps.filterEntity).toHaveBeenCalledWith('User', filterQuery, undefined, undefined);
    });

    it('should return 400 for invalid entity', async () => {
      const request = new NextRequest('http://localhost:3000/api/entities/InvalidEntity');
      const params = Promise.resolve({ entity: 'InvalidEntity' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid entity');
    });

    it('should handle errors gracefully', async () => {
      (dbOps.listEntity as jest.Mock).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/entities/User');
      const params = Promise.resolve({ entity: 'User' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Database error');
    });
  });

  describe('POST /api/entities/[entity]', () => {
    it('should create a single entity', async () => {
      const mockData = { id: 1, name: 'Test', email: 'test@test.com' };
      (dbOps.createEntity as jest.Mock).mockResolvedValue(mockData);

      const body = { name: 'Test', email: 'test@test.com' };
      const request = new NextRequest('http://localhost:3000/api/entities/User', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      const params = Promise.resolve({ entity: 'User' });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockData);
      expect(dbOps.createEntity).toHaveBeenCalledWith('User', body);
    });

    it('should bulk create entities', async () => {
      const mockData = [
        { id: 1, name: 'Test1' },
        { id: 2, name: 'Test2' },
      ];
      (dbOps.bulkCreateEntity as jest.Mock).mockResolvedValue(mockData);

      const body = [{ name: 'Test1' }, { name: 'Test2' }];
      const request = new NextRequest('http://localhost:3000/api/entities/User', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      const params = Promise.resolve({ entity: 'User' });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockData);
      expect(dbOps.bulkCreateEntity).toHaveBeenCalledWith('User', body);
    });

    it('should return 400 for invalid entity', async () => {
      const request = new NextRequest('http://localhost:3000/api/entities/InvalidEntity', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test' }),
      });
      const params = Promise.resolve({ entity: 'InvalidEntity' });

      const response = await POST(request, { params });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/entities/[entity]', () => {
    it('should update an entity', async () => {
      const mockData = { id: 1, name: 'Updated', email: 'updated@test.com' };
      (dbOps.updateEntity as jest.Mock).mockResolvedValue(mockData);

      const body = { id: 1, name: 'Updated', email: 'updated@test.com' };
      const request = new NextRequest('http://localhost:3000/api/entities/User', {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      const params = Promise.resolve({ entity: 'User' });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockData);
      expect(dbOps.updateEntity).toHaveBeenCalledWith('User', 1, {
        name: 'Updated',
        email: 'updated@test.com',
      });
    });

    it('should return 400 if id is missing', async () => {
      const body = { name: 'Updated' };
      const request = new NextRequest('http://localhost:3000/api/entities/User', {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      const params = Promise.resolve({ entity: 'User' });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('ID is required for update');
    });
  });

  describe('DELETE /api/entities/[entity]', () => {
    it('should delete an entity', async () => {
      (dbOps.deleteEntity as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/entities/User?id=1', {
        method: 'DELETE',
      });
      const params = Promise.resolve({ entity: 'User' });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(dbOps.deleteEntity).toHaveBeenCalledWith('User', '1');
    });

    it('should return 400 if id is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/entities/User', {
        method: 'DELETE',
      });
      const params = Promise.resolve({ entity: 'User' });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('ID is required for delete');
    });

    it('should handle not found errors', async () => {
      (dbOps.deleteEntity as jest.Mock).mockRejectedValue(new Error('User with id 999 not found'));

      const request = new NextRequest('http://localhost:3000/api/entities/User?id=999', {
        method: 'DELETE',
      });
      const params = Promise.resolve({ entity: 'User' });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('not found');
    });
  });
});

