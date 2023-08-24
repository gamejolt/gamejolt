import { UserGameTrophy } from './game-trophy.model';
import { UserSiteTrophy } from './site-trophy.model';
import { UserBaseTrophyModel } from './user-base-trophy.model';

export function populateTrophies(trophyDatas: any[]): UserBaseTrophyModel[] {
	const trophies = [];
	for (const trophyData of trophyDatas) {
		if (trophyData.game_id) {
			const trophy = new UserGameTrophy(trophyData);
			trophies.push(trophy);
		} else {
			const trophy = new UserSiteTrophy(trophyData);
			trophies.push(trophy);
		}
	}
	return trophies;
}
