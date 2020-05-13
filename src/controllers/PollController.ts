import { Inject } from 'typedi';
import {
  Controller,
  Get,
  Post,
  Ctx,
  Body,
  BadRequestError,
  InternalServerError,
  Param,
  NotFoundError,
} from 'routing-controllers';

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
  async create(@Body() poll: { title: string; answers: string[] }) {
    if (
      !poll ||
      typeof poll.title !== 'string' ||
      !Array.isArray(poll.answers)
    ) {
      return new BadRequestError();
    }

    for (let answer of poll.answers) {
      if (typeof answer !== 'string') {
        return new BadRequestError();
      }
    }

    const newPoll = await this.pollService.createPoll(poll.title, poll.answers);
    if (newPoll) {
      return newPoll;
    } else {
      return new InternalServerError('Unable to create poll.');
    }
  }

  @Get('/:shortId')
  async get(@Param('shortId') shortId: string) {
    console.log(await this.pollService.getPollId(shortId));
    const poll = await this.pollService.getPoll(
      await this.pollService.getPollId(shortId)
    );
    if (!poll) {
      return new NotFoundError();
    }

    return poll;
  }

  @Post('/:shortId/vote')
  async vote() {}
}
