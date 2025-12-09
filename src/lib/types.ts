export enum CardType {
  RED = 'RED',
  BLUE = 'BLUE',
  WHITE = 'WHITE',
}

export enum MemberStatus {
  PENDING = 'PENDING',
  CHOSEN = 'CHOSEN',
  TODO = 'TODO',
  DONE = 'DONE',
}

export enum ChosenTaskType {
  TAKE_CHALLENGE = 1,
  CLAIM_REWARD = 2,
}

export interface Member {
  id: string;
  UUID: string;
  Name: string;
  ChosenTaskType?: ChosenTaskType;
  CardType?: CardType;
  Status: MemberStatus;
  NumberItem?: string;
  IsAdmin: boolean;
  TaskId?: string;
  ResultId?: string;
  CardStatus?: boolean;
}

export interface Task {
  id: string;
  descriptions: string;
  TaskType: CardType;
  Status: string;
}

export interface Result {
  id: string;
  ResultNumber: string;
  Status: string;
  OwnerId?: string;
}

