import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { number } from '../../../../../../_common/filters/number';
import { FiresidePost } from '../../../../../../_common/fireside/post/post-model';
import { AppState, AppStore } from '../../../../../../_common/store/app-store';
import { AppTooltip } from '../../../../../../_common/tooltip/tooltip';

@Component({
	directives: {
		AppTooltip,
	},
})
export default class AppEventItemControlsFiresidePostStats extends Vue {
	@Prop(FiresidePost)
	post!: FiresidePost;

	@AppState
	user!: AppStore['user'];

	readonly number = number;

	get hasPerms() {
		if (!this.user) {
			return false;
		}
		return this.post.isEditableByUser(this.user);
	}

	get shouldShowStats() {
		return this.hasPerms && this.post.isActive;
	}
}
