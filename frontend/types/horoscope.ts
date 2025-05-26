export interface HoroscopeTrait {
  energy: number;
  charisma: number;
  creativity: number;
  collaboration: number;
}

export interface Horoscope {
  date: string;
  traits: HoroscopeTrait;
  message: string;
}

export interface GithubData {
  commits: number;
  stars: number;
  repos: number;
  followers: number;
} 