export interface DemoGamePreset {
  gamePk: number;
  date: string;
  title: string;
  subtitle: string;
  awayTeam: string;
  homeTeam: string;
  highlights: string[];
}

export const DEMO_GAMES: DemoGamePreset[] = [
  {
    gamePk: 746011,
    date: '2024-09-19',
    title: '大谷翔平 歴史的「50-50」達成試合',
    subtitle: 'LAD 20 - 4 MIA (6安打3本塁打10打点2盗塁)',
    awayTeam: 'Los Angeles Dodgers',
    homeTeam: 'Miami Marlins',
    highlights: ['大谷翔平 第49号・50号・51号本塁打', '110mph超ハードヒット連発', 'ドジャース大量20得点圧勝'],
  },
  {
    gamePk: 775325,
    date: '2024-10-25',
    title: '2024 ワールドシリーズ 第1戦',
    subtitle: 'NYY 3 - 6 LAD (フリーマン 逆転サヨナラ満塁弾)',
    awayTeam: 'New York Yankees',
    homeTeam: 'Los Angeles Dodgers',
    highlights: ['延長10回裏 フリーマン劇的逆転サヨナラ満塁ホームラン', '大谷翔平 vs コール', 'ドジャー・スタジアム大熱狂'],
  },
  {
    gamePk: 775303,
    date: '2024-10-11',
    title: '2024 NLDS 第5戦 (勝者突破)',
    subtitle: 'SD 0 - 2 LAD (山本由伸 vs ダルビッシュ有 魂の投げ合い)',
    awayTeam: 'San Diego Padres',
    homeTeam: 'Los Angeles Dodgers',
    highlights: ['山本由伸 5回無失点好投', 'ダルビッシュ有 7回途中2失点の力投', 'キケ＆テオスカー本塁打'],
  },
];
