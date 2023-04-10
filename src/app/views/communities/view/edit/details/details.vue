<script lang="ts">
import { setup } from 'vue-class-component';
import { Inject, Options } from 'vue-property-decorator';
import { enforceLocation } from '../../../../../../utils/router';
import AppAlertDismissable from '../../../../../../_common/alert/dismissable/dismissable.vue';
import AppEditableOverlay from '../../../../../../_common/editable-overlay/AppEditableOverlay.vue';
import { showInfoGrowl, showSuccessGrowl } from '../../../../../../_common/growls/growls.service';
import { ModalConfirm } from '../../../../../../_common/modal/confirm/confirm-service';
import {
	BaseRouteComponent,
	OptionsForRoute,
} from '../../../../../../_common/route/route-component';
import { Screen } from '../../../../../../_common/screen/screen-service';
import { useThemeStore } from '../../../../../../_common/theme/theme.store';
import { AppCommunityPerms } from '../../../../../components/community/perms/perms';
import FormCommunity from '../../../../../components/forms/community/community.vue';
import FormCommunityDescription from '../../../../../components/forms/community/description/FormCommunityDescription.vue';
import { useGridStore } from '../../../../../components/grid/grid-store';
import { useAppStore } from '../../../../../store';
import { CommunityThemeKey } from '../../RouteCommunitiesView.vue';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../../view.store';
import AppCommunitiesViewPageContainer from '../../_page-container/page-container.vue';

@Options({
	name: 'RouteCommunitiesViewEditDetails',
	components: {
		AppCommunitiesViewPageContainer,
		AppCommunityPerms,
		AppEditableOverlay,
		FormCommunity,
		FormCommunityDescription,
		AppAlertDismissable,
	},
})
@OptionsForRoute()
export default class RouteCommunitiesViewEditDetails extends BaseRouteComponent {
	@Inject({ from: CommunityRouteStoreKey })
	routeStore!: CommunityRouteStore;

	store = setup(() => useAppStore());
	themeStore = setup(() => useThemeStore());
	gridStore = setup(() => useGridStore());

	readonly Screen = Screen;

	get community() {
		return this.routeStore.community;
	}

	get collaborator() {
		return this.routeStore.collaborator;
	}

	get grid() {
		return this.gridStore.grid;
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
		await this.store.leaveCommunity(this.community, { grid: this.grid, shouldConfirm: false });

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
		await this.store.leaveCommunity(this.community, { grid: this.grid, shouldConfirm: false });

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
		<AppCommunitiesViewPageContainer>
			<template #default>
				<AppAlertDismissable
					v-if="isOwner"
					alert-type="info"
					:dismiss-key="`community-${community.id}.welcome-msg`"
				>
					<h2 class="section-header">
						<AppTranslate>Welcome to your new community! 🎉</AppTranslate>
					</h2>

					<ul>
						<li>
							<p>
								<strong>
									<AppTranslate>Your community is live!</AppTranslate>
								</strong>
								<br />
								<AppTranslate>
									Users can already see and join your community on Game Jolt.
								</AppTranslate>
							</p>
						</li>

						<li>
							<strong>
								<AppTranslate>Customize the %$@#! out of it</AppTranslate>
							</strong>
							<br />
							<AppTranslate>
								You can edit every aspect of your community in this page. Set a
								description, upload a thumbnail and header, customize your channels
								- make it real pretty!
							</AppTranslate>
						</li>

						<li>
							<strong>
								<AppTranslate>Assign moderators and collaborators</AppTranslate>
							</strong>
							<br />
							<AppTranslate>
								Invite others to help you moderate and contribute to your community.
							</AppTranslate>
						</li>

						<li>
							<strong><AppTranslate>Get Featured</AppTranslate></strong>
							<br />
							<AppTranslate>
								Share your community with your friends, post about it on Reddit,
								Facebook, Twitter and Discord. Game Jolt staff will be looking for
								active communities to feature on the home page.
							</AppTranslate>
						</li>
					</ul>
				</AppAlertDismissable>

				<!-- Details -->
				<AppCommunityPerms :community="community" required="community-details">
					<h2 class="section-header">
						<AppTranslate>Details</AppTranslate>
					</h2>

					<FormCommunity :model="community" @submit="onDetailsChange" />
					<div class="-spacer" />

					<template v-if="routeStore.canEditDescription && Screen.isMobile">
						<h2 class="section-header">
							<AppTranslate>Edit Description</AppTranslate>
						</h2>

						<FormCommunityDescription :model="community" />
						<div class="-spacer" />
					</template>
				</AppCommunityPerms>

				<!-- Leave/Remove Community -->
				<div class="-danger-zone well fill-offset">
					<template v-if="isOwner">
						<h2>
							<AppTranslate>Remove Community</AppTranslate>
						</h2>

						<div class="page-help">
							<p v-translate>
								Removing your community will remove it from the site completely.
								<b>This is permanent!</b>
							</p>
						</div>

						<AppButton @click="removeCommunity()">
							<AppTranslate>Remove Community</AppTranslate>
						</AppButton>
					</template>
					<template v-else>
						<h2>
							<AppTranslate>Leave Community</AppTranslate>
						</h2>

						<div class="page-help">
							<p>
								<AppTranslate>
									You are currently a moderator on this community. Leaving the
									community will revoke all of your moderation permissions.
								</AppTranslate>
							</p>
						</div>

						<AppButton @click="leaveCommunity()">
							<AppTranslate>Leave Community</AppTranslate>
						</AppButton>
					</template>
				</div>
			</template>

			<template v-if="routeStore.canEditDescription && !Screen.isMobile" #sidebar>
				<h2 class="section-header">
					<AppTranslate>Edit Description</AppTranslate>
				</h2>

				<FormCommunityDescription :model="community" />
			</template>
		</AppCommunitiesViewPageContainer>
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
