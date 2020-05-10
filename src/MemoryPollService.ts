import { PollService } from './types/PollService';
import { Poll, Answer } from './types/Poll';

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

  async vote(answerId: string): Promise<void> {
    if (this.answers[answerId]) {
      this.answers[answerId].count++;
    }
  }
}
