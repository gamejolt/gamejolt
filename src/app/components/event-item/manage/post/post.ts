import View from '!view!./post.html?style=./post.styl';
import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import { getLinkedAccountPlatformIcon } from 'game-jolt-frontend-lib/components/linked-account/linked-account.model';
import { AppPopper } from 'game-jolt-frontend-lib/components/popper/popper';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Store } from '../../../../store';
import { PostEditModal } from '../../../post/edit-modal/edit-modal-service';

@View
@Component({
	components: {
		AppPopper,
	},
	directives: {
		AppTooltip,
	},
})
export class AppEventItemManagePost extends Vue {
	@Prop(FiresidePost)
	post!: FiresidePost;

	@Prop(Boolean)
	showEditControls?: boolean;

	@State
	app!: Store['app'];

	readonly number = number;

	@Emit('edit')
	private emitEdit() {}

	@Emit('publish')
	private emitPublish() {}

	@Emit('remove')
	private emitRemove() {}

	get canPublish() {
		return this.post.isDraft && !this.post.isScheduled && !!this.post.lead;
	}

	getProviderIcon(provider: string) {
		return getLinkedAccountPlatformIcon(provider);
	}

	async openEdit() {
		if (await PostEditModal.show(this.post)) {
			this.emitEdit();
		}
	}

	async publishPost() {
		await this.post.$publish();
		this.emitPublish();
	}

	async removePost() {
		if (await this.post.remove()) {
			this.emitRemove();
		}
	}
}
