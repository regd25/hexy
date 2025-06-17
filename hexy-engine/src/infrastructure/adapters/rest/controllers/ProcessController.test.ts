import { Request, Response } from 'express';
import { ProcessController } from './ProcessController';

describe('ProcessController', () => {
  let processController: ProcessController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    // Create controller instance
    processController = new ProcessController();

    // Mock Express request and response
    mockRequest = {
      params: {},
      query: {},
      body: {},
    };

    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
  });

  describe('listProcesses', () => {
    it('should return empty list when no processes exist', async () => {
      mockRequest.query = { limit: '10', offset: '0' };

      await processController.listProcesses(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          processes: [],
          pagination: {
            limit: 10,
            offset: 0,
            total: 0,
          },
        },
      });
    });

    it('should handle query parameters correctly', async () => {
      mockRequest.query = { domain: 'test-domain', limit: '5', offset: '10' };

      await processController.listProcesses(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          processes: [],
          pagination: {
            limit: 5,
            offset: 10,
            total: 0,
          },
        },
      });
    });

    it('should handle errors gracefully', async () => {
      // Force an error by making query undefined
      mockRequest.query = undefined as any;

      await processController.listProcesses(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Failed to list processes',
          details: expect.any(String),
        },
      });
    });
  });

  describe('getProcess', () => {
    it('should return 404 when process not found', async () => {
      mockRequest.params = { id: 'non-existent-process' };

      await processController.getProcess(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Process not found',
          code: 'PROCESS_NOT_FOUND',
        },
      });
    });
  });

  describe('executeProcessEndpoint', () => {
    it('should execute process successfully with mock data', async () => {
      mockRequest.params = { id: 'test-process' };
      mockRequest.body = { context: {}, parameters: {} };

      await processController.executeProcessEndpoint(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          processId: 'test-process',
          status: 'COMPLETED',
          currentStep: 1,
          totalSteps: 1,
          results: expect.arrayContaining([
            expect.objectContaining({
              stepIndex: 0,
              actor: 'MockActor',
              action: 'MockAction',
              success: true,
              output: 'Process executed successfully',
            }),
          ]),
          errors: [],
        }),
      });
    });
  });

  describe('validateProcess', () => {
    it('should validate process successfully with mock data', async () => {
      mockRequest.params = { id: 'test-process' };
      mockRequest.body = { content: { id: 'test', steps: [] } };

      await processController.validateProcess(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          isValid: true,
          errors: [],
          warnings: [],
          suggestions: ['Consider adding error handling'],
        },
      });
    });

    it('should return 400 when content is missing', async () => {
      mockRequest.params = { id: 'test-process' };
      mockRequest.body = {};

      await processController.validateProcess(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Process content is required',
          code: 'MISSING_CONTENT',
        },
      });
    });

    // Validation errors are handled by the mock implementation
  });

  describe('listProcessExecutions', () => {
    it('should return empty list when no executions exist', async () => {
      mockRequest.params = { id: 'test-process' };
      mockRequest.query = { limit: '10', offset: '0' };

      await processController.listProcessExecutions(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          executions: [],
          pagination: {
            limit: 10,
            offset: 0,
            total: 0,
          },
        },
      });
    });
  });

  describe('getExecution', () => {
    it('should return 404 when execution not found', async () => {
      mockRequest.params = { executionId: 'non-existent-execution' };

      await processController.getExecution(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Execution not found',
          code: 'EXECUTION_NOT_FOUND',
        },
      });
    });
  });

  describe('cancelExecution', () => {
    it('should return 501 for not implemented functionality', async () => {
      mockRequest.params = { executionId: 'test-execution' };

      await processController.cancelExecution(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(501);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Execution cancellation not implemented yet',
          code: 'NOT_IMPLEMENTED',
        },
      });
    });
  });
}); 