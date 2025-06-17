import { Request, Response } from 'express';
import { HexyEngine } from '../../../../index';

export class SystemController {
  /**
   * GET /api/system/info
   * Get engine information
   */
  public async getEngineInfo(__req: Request, res: Response): Promise<void> {
    try {
      const info = HexyEngine.getInfo();

      res.json({
        success: true,
        data: info,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get engine info',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }

  /**
   * GET /api/system/health
   * Get engine health status
   */
  public async getEngineHealth(__req: Request, res: Response): Promise<void> {
    try {
      const memUsage = process.memoryUsage();
      const uptime = process.uptime();

      const health = {
        status: 'healthy',
        uptime: `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
        memory: {
          heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
          external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
          rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
        },
        process: {
          pid: process.pid,
          version: process.version,
          platform: process.platform,
          arch: process.arch,
        },
        activeExecutions: 0, // TODO: Implement active execution tracking
        totalExecutions: 0, // TODO: Implement execution counter
        timestamp: new Date().toISOString(),
      };

      res.json({
        success: true,
        data: health,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get engine health',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }

  /**
   * GET /api/system/version
   * Get engine version
   */
  public async getEngineVersion(__req: Request, res: Response): Promise<void> {
    try {
      const version = HexyEngine.getVersion();

      res.json({
        success: true,
        data: {
          version,
          buildDate: new Date().toISOString(), // TODO: Use actual build date
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get engine version',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }

  /**
   * POST /api/system/shutdown
   * Gracefully shutdown the engine (for development/testing)
   */
  public async shutdown(__req: Request, res: Response): Promise<void> {
    try {
      res.json({
        success: true,
        data: {
          message: 'Shutdown initiated',
          timestamp: new Date().toISOString(),
        },
      });

      // Graceful shutdown after response
      setTimeout(() => {
        console.log('Graceful shutdown initiated...');
        process.exit(0);
      }, 1000);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to initiate shutdown',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }
}
