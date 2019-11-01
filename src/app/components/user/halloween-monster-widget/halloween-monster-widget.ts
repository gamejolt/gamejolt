import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { number } from '../../../../_common/filters/number';
import { HalloweenMonsterType } from '../../../../_common/halloween-monster/halloween-monster.model';
import AppProgressBar from '../../../../_common/progress/bar/bar.vue';
import { AppTooltip } from '../../../../_common/tooltip/tooltip';
import { Halloween2019MonsterBreakdown, User } from '../../../../_common/user/user.model';

@Component({
	components: {
		AppProgressBar,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppUserHalloweenMonsterWidget extends Vue {
	@Prop(User)
	user!: User;

	readonly number = number;

	get monsters(): Halloween2019MonsterBreakdown[] {
		const breakdown = this.user.halloween_2019_breakdown;
		if (!breakdown) {
			return [];
		}

		const monsters: Halloween2019MonsterBreakdown[] = [];
		for (let monsterType in breakdown) {
			const monster = breakdown[monsterType as HalloweenMonsterType];

			monster.type = monsterType;
			monster.imgUrl = require(`../../../img/halloween/${monsterType}_head.png`);
			monsters.push(monster);
		}
		return monsters;
	}

	get caughtMonsters() {
		return this.monsters.filter(i => i.current > 0);
	}

	get caughtAnything() {
		return this.caughtMonsters.length > 0;
	}
}
