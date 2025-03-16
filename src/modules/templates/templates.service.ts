import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import * as fs from 'fs/promises';
import { join } from 'path';
import * as ejs from 'ejs';

@Injectable()
export class TemplatesService {
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) { }

    async getCompiledTemplate(templateName: string, context: object): Promise<string> {
        const cacheKey = `template:${templateName}`;
        let template = await this.cacheManager.get<string>(cacheKey);

        if (!template) {
            template = await this.loadTemplate(templateName);
            await this.cacheManager.set(cacheKey, template, 3600);
        }

        return ejs.render(template, context);
    }

    private async loadTemplate(templateName: string): Promise<string> {
        try {
            return await fs.readFile(
                join(process.cwd(), 'assets', 'templates', `${templateName}.ejs`),
                'utf8'
            );
        } catch (error) {
            console.error(error);
            throw new Error(`Template ${templateName} not found`);
        }
    }
}   