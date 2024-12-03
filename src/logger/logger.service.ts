import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LoggerService {
  constructor() {}

  async log(serviceName: string, message: any) {
    const logger = new Logger(serviceName);
    logger.log(message);
  }

  async error(serviceName: string, message: any) {
    const logger = new Logger(serviceName);
    logger.error(message);
  }

  async warn(serviceName: string, message: any) {
    const logger = new Logger(serviceName);
    logger.warn(message);
  }

  async debug(serviceName: string, message: any) {
    const logger = new Logger(serviceName);
    logger.debug(message);
  }

  async verbose(serviceName: string, message: any) {
    const logger = new Logger(serviceName);
    logger.verbose(message);
  }
}
