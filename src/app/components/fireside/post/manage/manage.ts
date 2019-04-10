import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import { Environment } from 'game-jolt-frontend-lib/components/environment/environment.service';
import { FiresidePostCommunity } from 'game-jolt-frontend-lib/components/fireside/post/community/community.model';
import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import { getLinkedAccountPlatformIcon } from 'game-jolt-frontend-lib/components/linked-account/linked-account.model';
import AppPopper from 'game-jolt-frontend-lib/components/popper/popper.vue'
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Store } from '../../../../store';
import { PostEditModal } from '../../../post/edit-modal/edit-modal-service';

@Component({
	components: {
		AppPopper,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppFiresidePostManage extends Vue {
	@Prop(FiresidePost)
	post!: FiresidePost;

	@Prop(Boolean)
	showEditControls?: boolean;

	@Prop(Boolean)
	showCommunityControls?: boolean;

	@State
	app!: Store['app'];

	Environment = Environment;

	readonly number = number;

	@Emit('edit')
	emitEdit() {}

	@Emit('publish')
	emitPublish() {}

	@Emit('remove')
	emitRemove() {}

	@Emit('feature')
	emitFeature(_community: Community) {}

	@Emit('unfeature')
	emitUnfeature(_community: Community) {}

	@Emit('reject')
	emitReject(_community: Community) {}

	get canPublish() {
		return this.post.isDraft && !this.post.isScheduled && !!this.post.lead;
	}

	get hasPerms() {
		return this.post.isEditableByUser(this.app.user);
	}

	get shouldShowStats() {
		return this.hasPerms;
	}

	get shouldShowEdit() {
		return this.hasPerms && this.showEditControls;
	}

	get shouldShowManageCommunities() {
		return this.post.manageableCommunities.length !== 0 && this.showCommunityControls;
	}

	get shouldShowModTools() {
		return this.app.user && this.app.user.isMod;
	}

	getProviderIcon(provider: string) {
		return getLinkedAccountPlatformIcon(provider);
	}

	async toggleFeatured(postCommunity: FiresidePostCommunity) {
		if (postCommunity.isFeatured) {
			await this.post.$unfeature(postCommunity.community);
			this.emitUnfeature(postCommunity.community);
		} else {
			await this.post.$feature(postCommunity.community);
			this.emitFeature(postCommunity.community);
		}
	}

	async rejectFromCommunity(postCommunity: FiresidePostCommunity) {
		await this.post.$reject(postCommunity.community);
		this.emitReject(postCommunity.community);
	}

	async openEdit() {
		if (await PostEditModal.show(this.post)) {
			this.emitEdit();
		}
	}

	async publish() {
		await this.post.$publish();
		this.emitPublish();
	}

	async remove() {
		if (await this.post.remove()) {
			this.emitRemove();
		}
	}
}
