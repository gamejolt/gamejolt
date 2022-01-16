<script lang="ts">
import { setup } from 'vue-class-component';
import { Inject, Options } from 'vue-property-decorator';
import { enforceLocation } from '../../../../../../utils/router';
import AppAlertDismissable from '../../../../../../_common/alert/dismissable/dismissable.vue';
import AppCommunityThumbnailImg from '../../../../../../_common/community/thumbnail/img/img.vue';
import AppEditableOverlay from '../../../../../../_common/editable-overlay/editable-overlay.vue';
import { showInfoGrowl, showSuccessGrowl } from '../../../../../../_common/growls/growls.service';
import { ModalConfirm } from '../../../../../../_common/modal/confirm/confirm-service';
import { BaseRouteComponent } from '../../../../../../_common/route/route-component';
import { Screen } from '../../../../../../_common/screen/screen-service';
import { useThemeStore } from '../../../../../../_common/theme/theme.store';
import { AppCommunityPerms } from '../../../../../components/community/perms/perms';
import FormCommunity from '../../../../../components/forms/community/community.vue';
import FormCommunityDescription from '../../../../../components/forms/community/description/description.vue';
import { useAppStore } from '../../../../../store';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../../view.store';
import { CommunityThemeKey } from '../../view.vue';
import AppCommunitiesViewPageContainer from '../../_page-container/page-container.vue';

@Options({
	name: 'RouteCommunitiesViewEditDetails',
	components: {
		AppCommunitiesViewPageContainer,
		AppCommunityPerms,
		AppEditableOverlay,
		AppCommunityThumbnailImg,
		FormCommunity,
		FormCommunityDescription,
		AppAlertDismissable,
	},
})
export default class RouteCommunitiesViewEditDetails extends BaseRouteComponent {
	@Inject({ from: CommunityRouteStoreKey })
	routeStore!: CommunityRouteStore;

	store = setup(() => useAppStore());
	themeStore = setup(() => useThemeStore());

	readonly Screen = Screen;

	get community() {
		return this.routeStore.community;
	}

	get collaborator() {
		return this.routeStore.collaborator;
	}

	get isOwner() {
		// The owner's collaboration is not returned from backend.
		return this.collaborator === null;
	}

	onDetailsChange() {
		// If the community path changes, we need to replace the route,
		// otherwise when navigating to the community view routes, it'll attempt to navigate
		// to the old name.
		if (this.community.path !== this.$route.params.path) {
			const newLocation = enforceLocation(this.$route, { path: this.community.path });
			if (newLocation) {
				this.$router.replace(newLocation.location);
			}
		}

		this.themeStore.setPageTheme({
			key: CommunityThemeKey,
			theme: this.community.theme,
		});
	}

	async removeCommunity() {
		const result = await ModalConfirm.show(
			this.$gettext(
				`Are you sure you want to permanently remove your community? Once it's gone, it's gone forever.`
			)
		);
		if (!result) {
			return;
		}

		await this.community.$remove();
		await this.store.leaveCommunity(this.community, undefined, { shouldConfirm: false });

		showInfoGrowl(
			this.$gettext(`Your community has been removed from the site.`),
			this.$gettext(`Community Removed`)
		);

		this.$router.push({ name: 'home' });
	}

	async leaveCommunity() {
		if (!this.collaborator) {
			return;
		}

		const result = await ModalConfirm.show(
			this.$gettext(`Are you sure you want to leave this community?`),
			this.$gettext(`Leave community?`)
		);
		if (!result) {
			return;
		}

		await this.collaborator.$remove();
		await this.store.leaveCommunity(this.community, undefined, { shouldConfirm: false });

		showSuccessGrowl(
			this.$gettext(`You left the community. You will be missed! ;A;`),
			this.$gettext(`Left Community`)
		);

		this.$router.push({ name: 'home' });
	}
}
</script>

<template>
	<div>
		<app-communities-view-page-container>
			<template #default>
				<app-alert-dismissable
					v-if="isOwner"
					alert-type="info"
					:dismiss-key="`community-${community.id}.welcome-msg`"
				>
					<h2 class="section-header">
						<translate>Welcome to your new community! 🎉</translate>
					</h2>

					<ul>
						<li>
							<p>
								<strong><translate>Your community is live!</translate></strong>
								<br />
								<translate>
									Users can already see and join your community on Game Jolt.
								</translate>
							</p>
						</li>

						<li>
							<strong><translate>Customize the %$@#! out of it</translate></strong>
							<br />
							<translate>
								You can edit every aspect of your community in this page. Set a
								description, upload a thumbnail and header, customize your channels
								- make it real pretty!
							</translate>
						</li>

						<li>
							<strong>
								<translate>Assign moderators and collaborators</translate>
							</strong>
							<br />
							<translate>
								Invite others to help you moderate and contribute to your community.
							</translate>
						</li>

						<li>
							<strong><translate>Get Featured</translate></strong>
							<br />
							<translate>
								Share your community with your friends, post about it on Reddit,
								Facebook, Twitter and Discord. Game Jolt staff will be looking for
								active communities to feature on the home page.
							</translate>
						</li>
					</ul>
				</app-alert-dismissable>

				<!-- Details -->
				<app-community-perms :community="community" required="community-details">
					<h2 class="section-header">
						<translate>Details</translate>
					</h2>

					<form-community :model="community" @submit="onDetailsChange" />
					<div class="-spacer" />

					<template v-if="routeStore.canEditDescription && Screen.isMobile">
						<h2 class="section-header">
							<translate>Edit Description</translate>
						</h2>

						<form-community-description :model="community" />
						<div class="-spacer" />
					</template>
				</app-community-perms>

				<!-- Leave/Remove Community -->
				<div class="-danger-zone well fill-offset">
					<template v-if="isOwner">
						<h2>
							<translate>Remove Community</translate>
						</h2>

						<div class="page-help">
							<p v-translate>
								Removing your community will remove it from the site completely.
								<b>This is permanent!</b>
							</p>
						</div>

						<app-button @click="removeCommunity()">
							<translate>Remove Community</translate>
						</app-button>
					</template>
					<template v-else>
						<h2>
							<translate>Leave Community</translate>
						</h2>

						<div class="page-help">
							<p>
								<translate>
									You are currently a moderator on this community. Leaving the
									community will revoke all of your moderation permissions.
								</translate>
							</p>
						</div>

						<app-button @click="leaveCommunity()">
							<translate>Leave Community</translate>
						</app-button>
					</template>
				</div>
			</template>

			<template v-if="routeStore.canEditDescription && !Screen.isMobile" #sidebar>
				<h2 class="section-header">
					<translate>Edit Description</translate>
				</h2>

				<form-community-description :model="community" />
			</template>
		</app-communities-view-page-container>
	</div>
</template>

<style lang="stylus" scoped>
.-spacer
	margin-top: $line-height-computed

	@media $media-sm-up
		margin-top: $line-height-computed * 2

.-danger-zone
	h2:first-of-type
		margin-top: 0
</style>
