import { Options, Prop, Vue } from 'vue-property-decorator';
import { formatNumber } from '../../../../_common/filters/number';
import { GameTrophy } from '../../../../_common/game/trophy/trophy.model';
import { AppTimeAgo } from '../../../../_common/time/ago/ago';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { UserGameTrophy } from '../../../../_common/user/trophy/game-trophy.model';
import AppTrophyThumbnail from '../thumbnail/thumbnail.vue';

@Options({
	components: {
		AppTrophyThumbnail,
		AppTimeAgo,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppTrophyList extends Vue {
	@Prop(Array) trophies!: GameTrophy[];
	@Prop(Array) achieved!: UserGameTrophy[];

	readonly number = formatNumber;

	get achievedIndexed() {
		return UserGameTrophy.indexAchieved(this.achieved);
	}
}
