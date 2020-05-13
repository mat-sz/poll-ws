import { v4 as uuid } from 'uuid';
import { Service } from 'typedi';

import { PollService } from '../types/PollService';
import { Poll, Answer } from '../types/Poll';
import { generateShortId } from '../utils/ShortIdGenerator';

@Service()
export class MemoryPollService implements PollService {
  private polls: Record<string, Poll> = {};
  private shortIds: Record<string, string> = {};
  private answers: Record<string, Answer> = {};

  async getPoll(pollId: string): Promise<Poll | undefined> {
    if (!this.polls[pollId]) {
      return undefined;
    }

    return {
      ...this.polls[pollId],
      answers: this.polls[pollId].answerIds.map(id => this.answers[id]),
    };
  }

  async getPollId(shortId: string): Promise<string | undefined> {
    return this.shortIds[shortId];
  }

  async createPoll(
    title: string,
    answers: string[]
  ): Promise<Poll | undefined> {
    const answerModels: Answer[] = answers.map(answer => {
      return {
        id: uuid(),
        text: answer,
        count: 0,
      } as Answer;
    });

    const pollModel: Poll = {
      id: uuid(),
      title,
      answerIds: answerModels.map(answer => answer.id),
    };

    const shortId = generateShortId();
    answerModels.forEach(answer => {
      this.answers[answer.id] = answer;
    });
    this.polls[pollModel.id] = pollModel;
    this.shortIds[shortId] = pollModel.id;

    const poll = await this.getPoll(pollModel.id);
    if (!poll) {
      return undefined;
    }

    return {
      ...poll,
      shortId,
    };
  }

  async vote(answerId: string): Promise<void> {
    if (this.answers[answerId]) {
      this.answers[answerId].count++;
    }
  }
}
