import { HalloweenMonster } from '../../../../../_common/halloween-monster/halloween-monster.model';
import AppShellHalloween from '../halloween';
import { Candy } from './candy';
import Pumpkin from './pumpkin';
import { Vampire } from './vampire';
import { Witch } from './witch';
import { Zombie } from './zombie';

export default abstract class MonsterFactory {
	static create(monster: HalloweenMonster, shell: AppShellHalloween) {
		switch (monster.type) {
			case 'pumpkin':
				return new Pumpkin(monster, shell);
			case 'zombie':
				return new Zombie(monster, shell);
			case 'witch':
				return new Witch(monster, shell);
			case 'candy':
				return new Candy(monster, shell);
			case 'vampire':
				return new Vampire(monster, shell);
		}
	}
}
