export interface Answer {
  id: string;
  pollId: string;
  text: string;
  count: number;
}

export interface Poll {
  id: string;
  title: string;
  answers?: Answer[];
  shortId?: string;
}
