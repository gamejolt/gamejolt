import { Options, Prop, Vue } from 'vue-property-decorator';
import { formatNumber } from '../../../../_common/filters/number';
import AppProgressBar from '../../../../_common/progress/bar/bar.vue';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { User } from '../../../../_common/user/user.model';

@Options({
	components: {
		AppProgressBar,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppUserLevelWidget extends Vue {
	@Prop(Object) user!: User;

	readonly formatNumber = formatNumber;

	get tooltip() {
		return this.$gettextInterpolate('%{ percentage }% progress to next level', {
			percentage: this.user.level_next_percentage,
		});
	}
}
