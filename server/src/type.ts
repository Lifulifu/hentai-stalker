
export interface GalleryMetaData {
  gid: number, // 525116,
  token: string, // 'f357c92bd9',
  archiver_key: string, // '469384--42e46df4f3e31719e0eedd40a609d76df71055e9',
  title: string, // '- Artist - Ronna',
  title_jpn: string, // '',
  category: string, // 'Image Set',
  thumb: string, // 'https://ehgt.org/d7/5c/d75c15273b68b328341345d85a63bca5e7c5a8e1-508244-1066-800-jpg_l.jpg',
  uploader: string, // 'taiko101',
  posted: string; // '1347299055',
  filecount: string; // '30',
  filesize: number, // 21521655,
  expunged: boolean, // false,
  rating: string, // '4.05',
  torrentcount: string, // '0',
  torrents: any[], // [],
  tags: string[]; // [Array]
}

export interface UserData {
  id: string,
  pictureUrl: string,
  name: string,
  email: string;
}