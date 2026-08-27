import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ImageOptimizerService } from '../services/image-optimizer.service';

@Injectable()
export class WebpConversionInterceptor implements NestInterceptor {
  constructor(private readonly imageOptimizer: ImageOptimizerService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    if (request.body) {
      request.body = await this.imageOptimizer.processObjectPayload(request.body);
    }

    if (request.file) {
      if (request.file.mimetype && request.file.mimetype.startsWith('image/')) {
        request.file.buffer = await this.imageOptimizer.processBuffer(request.file.buffer);
        request.file.mimetype = 'image/webp';
        if (request.file.originalname) {
          request.file.originalname = request.file.originalname.replace(/\.[^/.]+$/, '') + '.webp';
        }
      }
    }

    if (request.files) {
      if (Array.isArray(request.files)) {
        for (const file of request.files) {
          if (file.mimetype && file.mimetype.startsWith('image/')) {
            file.buffer = await this.imageOptimizer.processBuffer(file.buffer);
            file.mimetype = 'image/webp';
            if (file.originalname) {
              file.originalname = file.originalname.replace(/\.[^/.]+$/, '') + '.webp';
            }
          }
        }
      } else if (typeof request.files === 'object') {
        for (const key of Object.keys(request.files)) {
          const files = request.files[key];
          if (Array.isArray(files)) {
            for (const file of files) {
              if (file.mimetype && file.mimetype.startsWith('image/')) {
                file.buffer = await this.imageOptimizer.processBuffer(file.buffer);
                file.mimetype = 'image/webp';
                if (file.originalname) {
                  file.originalname = file.originalname.replace(/\.[^/.]+$/, '') + '.webp';
                }
              }
            }
          }
        }
      }
    }

    return next.handle();
  }
}
