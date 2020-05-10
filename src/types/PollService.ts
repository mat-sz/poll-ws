import { Poll } from './Poll';

export interface PollService {
  getPoll(pollId: string): Promise<Poll | undefined>;
  getPollId(shortId: string): Promise<string | undefined>;
  createPoll(title: string, answers: string[]): Promise<Poll | undefined>;
  vote(answerId: string): Promise<void>;
}
