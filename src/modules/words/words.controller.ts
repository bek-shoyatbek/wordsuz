import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post, UseGuards
} from "@nestjs/common";
import { WordsService } from './words.service';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiParam, ApiTags } from "@nestjs/swagger";
import { wordDetailsExample } from './examples';
import { UpdateWordDto } from './dto/update-word.dto';
import { UpdateDefinitionDto } from './dto/update-definition.dto';
import { UpdateExampleDto } from './dto/update-example.dto';
import { UpdateVerbFormDto } from './dto/update-verb.dto';
import { CreateDefinitionDto } from './dto/create-definition.dto';
import { CreateExampleDto } from './dto/create-example.dto';
import { CreateVerbFormDto } from './dto/create-verb-form.dto';
import { RolesGuard } from "../auth/guards/roles.guard";
import { AuthGuard } from "@nestjs/passport";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../auth/types";

@ApiTags('Words')
@Controller('words')
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @ApiParam({
    name: 'wordId',
    type: 'string',
    description: 'enter a wordId to get it',
  })
  @Get('single/:wordId')
  async getWordById(
    @Param('wordId', new ParseUUIDPipe({ version: '4' })) wordId: string,
  ) {
    return this.wordsService.getWordById(wordId);
  }

  @ApiParam({
    name: 'word',
    type: 'string',
    description: 'A word to get details',
  })
  @ApiOkResponse({ schema: { type: 'object', example: wordDetailsExample } })
  @Get(':word')
  async getWord(@Param('word') word: string) {
    return await this.wordsService.getWord(word);
  }

  @ApiParam({
    name: 'word',
    type: 'string',
    description: 'part of a word to get similar words',
  })
  @ApiOkResponse({ schema: { type: 'array' } })
  @Get('similar/:word')
  async getSimilarWords(@Param('word') word: string) {
    return await this.wordsService.getSimilarWordsFromDB(word);
  }

  @Post(':wordId/definitions')
  @UseGuards(AuthGuard('jwt-access'), RolesGuard)
  @Roles(UserRole.Admin)
  @ApiBearerAuth()
  @ApiParam({ name: 'wordId', type: 'string', description: 'UUID of the word' })
  @ApiBody({
    schema: {
      example: {
        typeEn: 'noun',
        typeUz: 'ot',
        meaning: 'An object or concept that is named',
        plural: 'nouns',
      },
    },
  })
  @ApiOkResponse({ description: 'Definition created successfully' })
  async addDefinition(
    @Param('wordId', new ParseUUIDPipe()) wordId: string,
    @Body() dto: CreateDefinitionDto,
  ) {
    return this.wordsService.addDefinition(wordId, dto);
  }

  @Post(':wordId/examples')
  @ApiParam({ name: 'wordId', type: 'string', description: 'UUID of the word' })
  @ApiBody({
    schema: {
      example: {
        phrase: 'This is an example sentence.',
        translation: 'Bu misol gap.',
        isVerified: true,
      },
    },
  })
  @ApiOkResponse({ description: 'Example created successfully' })
  async addExample(
    @Param('wordId', new ParseUUIDPipe()) wordId: string,
    @Body() dto: CreateExampleDto,
  ) {
    return this.wordsService.addExample(wordId, dto);
  }

  @Post(':wordId/verb-forms')
  @ApiParam({ name: 'wordId', type: 'string', description: 'UUID of the word' })
  @ApiBody({
    schema: {
      example: {
        tense: 'Past Simple',
        content: {
          forms: [
            {
              singular: 'I walked',
              plural: 'We walked',
            },
          ],
        },
      },
    },
  })
  @ApiOkResponse({ description: 'Verb form created successfully' })
  async addVerbForm(
    @Param('wordId', new ParseUUIDPipe()) wordId: string,
    @Body() dto: CreateVerbFormDto,
  ) {
    return this.wordsService.addVerbForm(wordId, dto);
  }

  @Patch(':wordId')
  @ApiParam({
    name: 'wordId',
    type: 'string',
    description: 'UUID of the word to update',
  })
  @ApiBody({
    schema: {
      example: {
        titleUz: 'yangi soʻz',
        transcription: 'səʊz',
        usageFrequency: 85,
        synonyms: ['term', 'expression'],
        anagrams: ['sowz', 'zows'],
      },
    },
  })
  @ApiOkResponse({ description: 'Word updated successfully' })
  async updateWord(
    @Param('wordId', new ParseUUIDPipe()) wordId: string,
    @Body() updateDto: UpdateWordDto,
  ) {
    return this.wordsService.updateWord(wordId, updateDto);
  }

  @Patch(':wordId/definitions/:definitionId')
  @ApiParam({ name: 'wordId', type: 'string', description: 'UUID of the word' })
  @ApiParam({
    name: 'definitionId',
    type: 'string',
    description: 'UUID of the definition to update',
  })
  @ApiBody({
    schema: {
      example: {
        typeEn: 'noun',
        typeUz: 'ot',
        meaning: 'A tool used for cutting',
        plural: 'tools',
      },
    },
  })
  @ApiOkResponse({ description: 'Definition updated successfully' })
  async updateDefinition(
    @Param('definitionId', new ParseUUIDPipe()) definitionId: string,
    @Body() updateDto: UpdateDefinitionDto,
  ) {
    return this.wordsService.updateDefinition(definitionId, updateDto);
  }

  @Patch(':wordId/examples/:exampleId')
  @ApiParam({ name: 'wordId', type: 'string', description: 'UUID of the word' })
  @ApiParam({
    name: 'exampleId',
    type: 'string',
    description: 'UUID of the example to update',
  })
  @ApiBody({
    schema: {
      example: {
        phrase: 'He used a tool to fix the door.',
        translation: 'U eshikni tuzatish uchun asbobdan foydalandi.',
        isVerified: true,
      },
    },
  })
  @ApiOkResponse({ description: 'Example updated successfully' })
  async updateExample(
    @Param('exampleId', new ParseUUIDPipe()) exampleId: string,
    @Body() updateDto: UpdateExampleDto,
  ) {
    return this.wordsService.updateExample(exampleId, updateDto);
  }

  @Patch(':wordId/verb-forms/:verbFormId')
  @ApiParam({ name: 'wordId', type: 'string', description: 'UUID of the word' })
  @ApiParam({
    name: 'verbFormId',
    type: 'string',
    description: 'UUID of the verb form to update',
  })
  @ApiBody({
    schema: {
      example: {
        tense: 'Present Simple',
        content: {
          forms: [
            {
              singular: 'He walks',
              plural: 'They walk',
            },
          ],
        },
      },
    },
  })
  @ApiOkResponse({ description: 'Verb form updated successfully' })
  async updateVerbForm(
    @Param('verbFormId', new ParseUUIDPipe()) verbFormId: string,
    @Body() updateDto: UpdateVerbFormDto,
  ) {
    return this.wordsService.updateVerbForm(verbFormId, updateDto);
  }
}
