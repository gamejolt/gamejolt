import { Environment } from '../../../../_common/environment/environment.service';
import { AppTimeAgo } from '../../../../_common/time/ago/ago';
import { UserGameScore } from '../../../../_common/user/game-score/game-score.model';
import AppUserAvatar from '../../../../_common/user/user-avatar/user-avatar.vue';
import { number } from '../../../../_common/filters/number';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({
	components: {
		AppUserAvatar,
		AppTimeAgo,
	},
	filters: {
		number,
	},
})
export default class AppScoreList extends Vue {
	@Prop(Array) scores!: UserGameScore[];
	@Prop(Number) startRank?: number;
	@Prop(Number) step?: number;

	readonly Environment = Environment;
}
