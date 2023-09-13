import { UserGameTrophyModel } from './game-trophy.model';
import { UserSiteTrophyModel } from './site-trophy.model';
import { UserBaseTrophyModel } from './user-base-trophy.model';

export function populateTrophies(trophyDatas: any[]): UserBaseTrophyModel[] {
	const trophies = [];
	for (const trophyData of trophyDatas) {
		if (trophyData.game_id) {
			const trophy = new UserGameTrophyModel(trophyData);
			trophies.push(trophy);
		} else {
			const trophy = new UserSiteTrophyModel(trophyData);
			trophies.push(trophy);
		}
	}
	return trophies;
}
