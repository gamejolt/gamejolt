import { Options, Prop, Vue } from 'vue-property-decorator';
import { formatNumber } from '../../../../../_common/filters/number';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import { AppState, AppStore } from '../../../../../_common/store/app-store';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';

@Options({
	directives: {
		AppTooltip,
	},
})
export default class AppPostControlsStats extends Vue {
	@Prop({ type: FiresidePost, required: true })
	post!: FiresidePost;

	@AppState user!: AppStore['user'];

	readonly number = formatNumber;

	get hasPerms() {
		if (!this.user) {
			return false;
		}
		return this.post.isEditableByUser(this.user);
	}

	get shouldShowStats() {
		return this.hasPerms && this.post.isActive && !this.post.is_processing;
	}
}
