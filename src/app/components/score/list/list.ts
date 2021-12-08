import { Options, Prop, Vue } from 'vue-property-decorator';
import { Environment } from '../../../../_common/environment/environment.service';
import { formatNumber } from '../../../../_common/filters/number';
import { AppTimeAgo } from '../../../../_common/time/ago/ago';
import AppUserCardHover from '../../../../_common/user/card/hover/hover.vue';
import { UserGameScore } from '../../../../_common/user/game-score/game-score.model';
import AppUserAvatar from '../../../../_common/user/user-avatar/user-avatar.vue';
import AppUserVerifiedTick from '../../../../_common/user/verified-tick/verified-tick.vue';

@Options({
	components: {
		AppUserAvatar,
		AppTimeAgo,
		AppUserCardHover,
		AppUserVerifiedTick,
	},
})
export default class AppScoreList extends Vue {
	@Prop(Array) scores!: UserGameScore[];
	@Prop(Number) startRank?: number;
	@Prop(Number) step?: number;

	readonly Environment = Environment;
	readonly formatNumber = formatNumber;
}
