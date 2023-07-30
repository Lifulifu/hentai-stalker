export interface UserData {
  id: string,
  pictureUrl: string,
  name: string,
  email: string;
}

export interface KeywordItem {
  keyword: string;
  keywordId: string;
  addedTime: string;
}

export interface GalleryData {
  keyword: string;
  url: string;
  thumbUrl: string;
  title: string;
  postedTime: string;
  addedTime: string;
}