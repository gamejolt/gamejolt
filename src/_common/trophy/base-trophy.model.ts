import { Model } from '../model/model.service';

export const enum BaseTrophyDifficulty {
	Bronze = 1,
	Silver = 2,
	Gold = 3,
	Platinum = 4,
}

export abstract class BaseTrophyModel extends Model {
	static readonly difficulties = <BaseTrophyDifficulty[]>[
		BaseTrophyDifficulty.Bronze,
		BaseTrophyDifficulty.Silver,
		BaseTrophyDifficulty.Gold,
		BaseTrophyDifficulty.Platinum,
	];

	declare difficulty: BaseTrophyDifficulty;
	declare title: string;
	declare description: string;
	declare experience: number;
	declare img_thumbnail: string;
	declare has_thumbnail: boolean;
	declare secret: boolean;
	declare is_owner: boolean;
	declare visible: boolean;
	declare is_achieved: boolean;
	declare has_perms: boolean;

	get isInfoRevealed() {
		return !this.secret || this.is_achieved || this.has_perms;
	}

	get difficultyLabel() {
		switch (this.difficulty) {
			case BaseTrophyDifficulty.Bronze:
				return 'Bronze';
			case BaseTrophyDifficulty.Silver:
				return 'Silver';
			case BaseTrophyDifficulty.Gold:
				return 'Gold';
			case BaseTrophyDifficulty.Platinum:
				return 'Platinum';
		}
	}
}
