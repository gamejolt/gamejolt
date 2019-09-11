import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Community } from '../../../../../_common/community/community.model';
import { Environment } from '../../../../../_common/environment/environment.service';
import { number } from '../../../../../_common/filters/number';
import { FiresidePostCommunity } from '../../../../../_common/fireside/post/community/community.model';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import { getLinkedAccountPlatformIcon } from '../../../../../_common/linked-account/linked-account.model';
import AppPopper from '../../../../../_common/popper/popper.vue';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip';
import { Store } from '../../../../store';
import { AppCommunityPerms } from '../../../community/perms/perms';
import { PostEditModal } from '../../../post/edit-modal/edit-modal-service';

@Component({
	components: {
		AppPopper,
		AppCommunityPerms,
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

	@Emit('pin')
	emitPin() {}

	@Emit('feature')
	emitFeature(_community: Community) {}

	@Emit('unfeature')
	emitUnfeature(_community: Community) {}

	@Emit('reject')
	emitReject(_community: Community) {}

	get canPublish() {
		return this.post.isDraft && !this.post.isScheduled && this.post.hasLead;
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

	get shouldShowPin() {
		return this.hasPerms && this.post.key_groups.length === 0;
	}

	shouldDisplayCommunityName(community: Community) {
		// If we are in the community in question and it's the only community option available
		return (
			this.post.manageableCommunities.length === 1 &&
			!(
				this.$route.name &&
				this.$route.name.includes('communities.view') &&
				this.$route.params.path === community.path
			)
		);
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

	async pin() {
		await this.post.$pin();
		this.emitPin();
	}

	unpin() {
		this.post.$unpin();
	}
}
