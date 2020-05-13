export interface Answer {
  id: string;
  text: string;
  count: number;
}

export interface Poll {
  id: string;
  title: string;
  answerIds: string[];
  answers?: Answer[];
  shortId?: string;
}
