import { Model } from '~common/model/model.service';

export const BaseTrophyDifficultyBronze = 1;
export const BaseTrophyDifficultySilver = 2;
export const BaseTrophyDifficultyGold = 3;
export const BaseTrophyDifficultyPlatinum = 4;

export type BaseTrophyDifficulty =
	| typeof BaseTrophyDifficultyBronze
	| typeof BaseTrophyDifficultySilver
	| typeof BaseTrophyDifficultyGold
	| typeof BaseTrophyDifficultyPlatinum;

export const BaseTrophyDifficulties = <BaseTrophyDifficulty[]>[
	BaseTrophyDifficultyBronze,
	BaseTrophyDifficultySilver,
	BaseTrophyDifficultyGold,
	BaseTrophyDifficultyPlatinum,
];

export abstract class BaseTrophyModel extends Model {
	declare difficulty: BaseTrophyDifficulty;
	declare title: string;
	declare description: string;
	declare experience: number;
	declare img_thumbnail: string;
	declare has_thumbnail: boolean;
	declare secret: boolean;
	declare is_owner: boolean;
	declare visible: boolean;
	declare is_achieved?: boolean;
	declare has_perms?: boolean;

	get isInfoRevealed() {
		return !this.secret || this.is_achieved || this.has_perms;
	}

	get difficultyLabel() {
		switch (this.difficulty) {
			case BaseTrophyDifficultyBronze:
				return 'Bronze';
			case BaseTrophyDifficultySilver:
				return 'Silver';
			case BaseTrophyDifficultyGold:
				return 'Gold';
			case BaseTrophyDifficultyPlatinum:
				return 'Platinum';
		}
	}
}
