import { IReview } from './review';

export interface IPreferences {
  categories: string[];
  publications: string[];
}

export interface IReader {
  id: string;
  username: string;
  name?: string;
  lastname?: string;
  subscribed: boolean;
  preferences?: IPreferences;
  created_at: string;
  updated_at?: string;
  profile_image?: string;
}

export interface IReaderPublicationInteraction {
  viewed: boolean;
  read: boolean;
  liked: boolean;
  reviewed: boolean;
  review: IReview;
  in_favorites: boolean;
}

export interface IReaderAuthorInteraction {
  followed: boolean;
}
