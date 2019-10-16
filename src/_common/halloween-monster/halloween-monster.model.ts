import { arrayRemove } from '../../utils/array';
import { Api } from '../api/api.service';
import { Model } from '../model/model.service';
import { Registry } from '../registry/registry.service';
import { Screen } from '../screen/screen-service';
import { Settings } from '../settings/settings.service';

export type HalloweenMonsterType = 'pumpkin' | 'candy' | 'zombie' | 'witch' | 'vampire';

export class HalloweenMonster extends Model {
	static encounters: HalloweenMonster[] = [];

	user_level!: number;
	seed!: string;
	type!: HalloweenMonsterType;

	constructor(data: any = {}) {
		super(data);

		Registry.store('HalloweenMonster', this);
	}

	static add(monster: HalloweenMonster) {
		if (Settings.get('halloween-2019-opted-out')) {
			return;
		}

		if (Screen.isDesktop) {
			this.encounters.push(monster);
		}
	}

	static remove(monster: HalloweenMonster) {
		arrayRemove(HalloweenMonster.encounters, item => item.id === monster.id);
	}

	async $capture() {
		const result = await Api.sendRequest('/web/halloween-2019/capture/' + this.id, null, {
			detach: true,
			processPayload: false,
		});

		if (!result || !result.data || !result.data.payload || !result.data.payload.success) {
			throw new Error('Failed to capture');
		}

		return result.data.payload;
	}
}

Model.create(HalloweenMonster);
