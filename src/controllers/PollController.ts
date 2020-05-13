import { Inject } from 'typedi';
import { Controller, Get, Post, Ctx, Body } from 'routing-controllers';

import { MemoryPollService } from '../services/MemoryPollService';

@Controller('/v1/poll')
export class PollController {
  @Inject()
  private pollService: MemoryPollService;

  @Get('/')
  async index() {
    // Unsupported.
    return {};
  }

  @Post('/')
  async create() {}

  @Get('/{shortId}')
  async get() {}

  @Post('/{shortId}/vote')
  async vote() {}
}
