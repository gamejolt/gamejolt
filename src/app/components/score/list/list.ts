import View from '!view!./list.html?style=./list.styl';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { Environment } from '../../../../lib/gj-lib-client/components/environment/environment.service';
import { AppTimeAgo } from '../../../../lib/gj-lib-client/components/time/ago/ago';
import { UserGameScore } from '../../../../lib/gj-lib-client/components/user/game-score/game-score.model';
import { AppUserAvatar } from '../../../../lib/gj-lib-client/components/user/user-avatar/user-avatar';
import { number } from '../../../../lib/gj-lib-client/vue/filters/number';

@View
@Component({
	components: {
		AppUserAvatar,
		AppTimeAgo,
	},
	filters: {
		number,
	},
})
export class AppScoreList extends Vue {
	@Prop(Array) scores!: UserGameScore[];
	@Prop(Number) startRank?: number;
	@Prop(Number) step?: number;

	readonly Environment = Environment;
}
