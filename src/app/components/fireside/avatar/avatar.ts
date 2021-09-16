import Vue from 'vue';
import { Component, Emit, Prop, Watch } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import AppCommunityThumbnailImg from '../../../../_common/community/thumbnail/img/img.vue';
import { FiresideCommunity } from '../../../../_common/fireside/community/community.model';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import { Growls } from '../../../../_common/growls/growls.service';
import AppMediaItemBackdrop from '../../../../_common/media-item/backdrop/backdrop.vue';
import { Popper } from '../../../../_common/popper/popper.service';
import AppPopper from '../../../../_common/popper/popper.vue';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/img/img.vue';
import { CommunityEjectFiresideModal } from '../../community/eject-fireside/modal/modal.service';

export interface FiresideAvatarEvent {
	fireside: Fireside;
	community: FiresideCommunity;
}

@Component({
	components: {
		AppUserAvatarImg,
		AppPopper,
		AppMediaItemBackdrop,
		AppCommunityThumbnailImg,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppFiresideAvatar extends Vue {
	@Prop({ type: Fireside, required: true })
	fireside!: Fireside;

	canEmitExpiry = true;
	expiryCheck: NodeJS.Timer | null = null;

	private isLoading = false;

	@Emit('eject') emitEject(_: FiresideAvatarEvent) {}
	@Emit('featured') emitFeatured(_: FiresideAvatarEvent) {}
	@Emit('unfeatured') emitUnfeatured(_: FiresideAvatarEvent) {}
	@Emit('expire') emitExpire() {}

	mounted() {
		this.setupCheck();
	}

	destroyed() {
		this.destroyExpiryCheck();
	}

	get community() {
		return this.fireside.community;
	}

	get isLive() {
		return this.fireside.is_streaming;
	}

	get title() {
		return this.fireside.title;
	}

	get canModerate() {
		return !this.isLoading && this.manageableCommunities.length > 0;
	}

	get manageableCommunities() {
		return this.fireside.community_links.filter(i =>
			i.community.hasPerms('community-firesides')
		);
	}

	get isFeaturedInCommunity() {
		return (
			!!this.community &&
			this.manageableCommunities.find(i => i.community.id === this.community!.id)
				?.isFeatured === true
		);
	}

	async toggleFeatured(community: FiresideCommunity) {
		Popper.hideAll();
		if (!community.community.hasPerms('community-firesides')) {
			return;
		}

		const isFeaturing = !community.isFeatured;
		try {
			this.isLoading = true;
			if (isFeaturing) {
				const promise = this.fireside.$feature();
				if (promise instanceof Promise) {
					await promise;
					this.emitFeatured({ fireside: this.fireside, community });
				}
			} else {
				const promise = this.fireside.$unfeature();
				if (promise instanceof Promise) {
					await promise;
					this.emitUnfeatured({ fireside: this.fireside, community });
				}
			}
		} catch (_) {
			Growls.error({
				message: isFeaturing
					? this.$gettext('Something went wrong while featuring this fireside...')
					: this.$gettext('Something went wrong while unfeaturing this fireside...'),
			});
		}
		this.isLoading = false;
	}

	async ejectFireside(community: FiresideCommunity) {
		Popper.hideAll();
		if (!community.community.hasPerms('community-firesides')) {
			return;
		}

		const result = await CommunityEjectFiresideModal.show(community, this.fireside);
		if (!result) {
			return;
		}

		try {
			this.isLoading = true;
			const response = await Api.sendRequest(
				`/web/communities/manage/eject-fireside/${community.id}`,
				{ notifyUser: result.notifyUser, reason: result.reason }
			);
			if (response.fireside) {
				this.fireside.assign(response.fireside);
			}
			this.emitEject({ fireside: this.fireside, community });
		} catch (_) {
			Growls.error({
				message: this.$gettext('Something went wrong while ejecting this fireside...'),
			});
		}
		this.isLoading = false;
	}

	private setupCheck() {
		// If the fireside is unjoinable from the get go, never emit expiry.
		if (!this.fireside.isOpen()) {
			this.canEmitExpiry = false;
		} else if (!GJ_IS_SSR) {
			this.canEmitExpiry = true;
			this.destroyExpiryCheck();
			setInterval(this.checkExpiry.bind(this), 1000);
		}
	}

	// Set up a watch here, so that when we refetch info about the fireside
	// without recreating this component, we reset the expiry checks.
	@Watch('fireside', { deep: true })
	watchFireside() {
		this.setupCheck();
	}

	private checkExpiry() {
		if (!this.canEmitExpiry) {
			return;
		}

		if (!this.fireside.isOpen()) {
			this.canEmitExpiry = false;
			this.emitExpire();
		}
	}

	private destroyExpiryCheck() {
		if (this.expiryCheck) {
			clearInterval(this.expiryCheck);
			this.expiryCheck = null;
		}
	}
}
