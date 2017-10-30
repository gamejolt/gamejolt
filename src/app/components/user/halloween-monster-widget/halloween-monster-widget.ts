import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./halloween-monster-widget.html?style=./halloween-monster-widget.styl';
import {
	User,
	Halloween2017MonsterBreakdown,
} from '../../../../lib/gj-lib-client/components/user/user.model';
import { AppProgressBar } from '../../../../lib/gj-lib-client/components/progress/bar/bar';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { number } from '../../../../lib/gj-lib-client/vue/filters/number';
import { HalloweenMonsterType } from '../../../../lib/gj-lib-client/components/halloween-monster/halloween-monster.model';

@View
@Component({
	components: {
		AppProgressBar,
	},
	directives: {
		AppTooltip,
	},
})
export class AppUserHalloweenMonsterWidget extends Vue {
	@Prop(User) user: User;

	readonly number = number;

	get monsters(): Halloween2017MonsterBreakdown[] {
		const breakdown = this.user.halloween_2017_breakdown;
		if (!breakdown) {
			return [];
		}

		const monsters: Halloween2017MonsterBreakdown[] = [];
		for (let monsterType in breakdown) {
			const monster = breakdown[monsterType as HalloweenMonsterType];

			monster.type = monsterType;
			monster.imgUrl = require(`../../../img/halloween/${monsterType}_head.png`);
			monsters.push(monster);
		}
		return monsters;
	}

	get caughtAnything() {
		return !!this.monsters.find(monster => monster.current > 0);
	}
}
