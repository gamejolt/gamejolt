<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { useGridStore } from '../../../app/components/grid/grid-store';
import { useAppStore } from '../../../app/store';
import { CommunityJoinLocation } from '../../analytics/analytics.service';
import { vAppAuthRequired } from '../../auth/auth-required-directive';
import { formatNumber } from '../../filters/number';
import { showErrorGrowl } from '../../growls/growls.service';
import { useCommonStore } from '../../store/common-store';
import { vAppTooltip } from '../../tooltip/tooltip-directive';
import { CommunityModel } from '../community.model';

@Options({
	directives: {
		AppAuthRequired: vAppAuthRequired,
		AppTooltip: vAppTooltip,
	},
})
export default class AppCommunityJoinWidget extends Vue {
	@Prop({ type: Object, required: true })
	community!: CommunityModel;

	@Prop({ type: String, required: true })
	location!: CommunityJoinLocation;

	@Prop({ type: Boolean, required: false, default: false })
	block?: boolean;

	@Prop({ type: Boolean, required: false, default: false })
	hideCount?: boolean;

	@Prop({ type: Boolean, required: false, default: false })
	solid?: boolean;

	store = setup(() => useAppStore());
	commonStore = setup(() => useCommonStore());
	gridStore = setup(() => useGridStore());

	get app() {
		return this.commonStore;
	}

	get grid() {
		return this.gridStore.grid;
	}

	isProcessing = false;

	get badge() {
		return !this.hideCount && this.community.member_count
			? formatNumber(this.community.member_count)
			: '';
	}

	get canJoin() {
		// Guests should always be allowed to attempt to join stuff.
		// When they log in, we can check if they are actually allowed.
		return !this.app.user || !!this.app.user.can_join_communities;
	}

	get isDisabled() {
		if (this.isProcessing) {
			return true;
		}

		// Always allow users to leave a community
		if (this.community.is_member) {
			return false;
		}

		return !this.canJoin;
	}

	async onClick() {
		if (!this.app.user || this.isProcessing) {
			return;
		}

		this.isProcessing = true;

		if (!this.community.is_member) {
			try {
				await this.store.joinCommunity(this.community, {
					grid: this.grid,
					location: this.location,
				});
			} catch (e) {
				console.log(e);
				let message = this.$gettext(
					`Something has prevented you from joining this community.`
				);
				if (e.errors && e.errors['limit-reached']) {
					message = this.$gettext(`You already joined too many communities!`);
				}

				showErrorGrowl(message);
			}
		} else {
			try {
				await this.store.leaveCommunity(this.community, {
					grid: this.grid,
					location: this.location,
					shouldConfirm: true,
				});
			} catch (e) {
				showErrorGrowl(this.$gettext(`For some reason we couldn't leave this community.`));
			}
		}

		this.isProcessing = false;
	}
}
</script>

<template>
	<AppButton
		v-app-auth-required
		v-app-tooltip="canJoin ? '' : $gettext(`You already joined too many communities`)"
		class="community-follow-widget"
		primary
		:block="block"
		:solid="community.is_member || solid"
		:badge="badge"
		:disabled="isDisabled"
		@click="onClick"
	>
		<template v-if="!community.is_member">
			<AppTranslate>Join Community</AppTranslate>
		</template>
		<template v-else>
			<AppTranslate>Joined</AppTranslate>
		</template>
	</AppButton>
</template>
