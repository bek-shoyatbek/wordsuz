import { Global, Module } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { CacheModule } from '@nestjs/cache-manager';

@Global()
@Module({
    imports: [CacheModule.register()],
    providers: [TemplatesService],
    exports: [TemplatesService],
})
export class TemplatesModule {} 