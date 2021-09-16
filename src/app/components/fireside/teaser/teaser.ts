import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import { Growls } from '../../../../_common/growls/growls.service';
import AppMediaItemBackdrop from '../../../../_common/media-item/backdrop/backdrop.vue';
import { Popper } from '../../../../_common/popper/popper.service';
import AppPopper from '../../../../_common/popper/popper.vue';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/img/img.vue';
import { CommunityEjectFiresideModal } from '../../community/eject-fireside/modal/modal.service';

@Component({
	components: {
		AppUserAvatarImg,
		AppPopper,
		AppMediaItemBackdrop,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppFiresideTeaser extends Vue {
	@Prop({ type: Fireside, required: true })
	fireside!: Fireside;

	private isLoading = false;

	@Emit('eject') emitEject(_: Fireside) {}
	@Emit('featured') emitFeatured(_: Fireside) {}
	@Emit('unfeatured') emitUnfeatured(_: Fireside) {}

	get isLive() {
		return this.fireside.is_streaming;
	}

	get title() {
		return this.fireside.title;
	}

	get communityLink() {
		return this.fireside.primaryCommunityLink;
	}

	get isFeaturedInCommunity() {
		return this.communityLink?.isFeatured === true;
	}

	get canModerate() {
		return !this.isLoading && this.fireside.community?.hasPerms('community-firesides') === true;
	}

	async toggleFeatured() {
		Popper.hideAll();
		if (!this.canModerate) {
			return;
		}

		const isFeaturing = !this.isFeaturedInCommunity;

		try {
			this.isLoading = true;
			if (isFeaturing) {
				const promise = this.fireside.$feature();
				if (promise instanceof Promise) {
					await promise;
					this.emitFeatured(this.fireside);
				}
			} else {
				const promise = this.fireside.$unfeature();
				if (promise instanceof Promise) {
					await promise;
					this.emitUnfeatured(this.fireside);
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

	async ejectFireside() {
		Popper.hideAll();
		if (!this.canModerate || !this.communityLink) {
			return;
		}

		const result = await CommunityEjectFiresideModal.show(this.communityLink, this.fireside);
		if (!result) {
			return;
		}

		try {
			this.isLoading = true;
			const response = await Api.sendRequest(
				`/web/communities/manage/eject-fireside/${this.communityLink.id}`,
				{ notifyUser: result.notifyUser, reason: result.reason }
			);
			if (response.fireside) {
				this.fireside.assign(response.fireside);
			}
			this.emitEject(this.fireside);
		} catch (_) {
			Growls.error({
				message: this.$gettext('Something went wrong while ejecting this fireside...'),
			});
		}
		this.isLoading = false;
	}
}
