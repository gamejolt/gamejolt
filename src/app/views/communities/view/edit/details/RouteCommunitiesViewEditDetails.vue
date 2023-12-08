<script lang="ts">
import { toRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppAlertDismissable from '../../../../../../_common/alert/dismissable/AppAlertDismissable.vue';
import AppButton from '../../../../../../_common/button/AppButton.vue';
import { $removeCollaboratorInvite } from '../../../../../../_common/collaborator/collaborator.model';
import { $removeCommunity } from '../../../../../../_common/community/community.model';
import { showInfoGrowl, showSuccessGrowl } from '../../../../../../_common/growls/growls.service';
import { showModalConfirm } from '../../../../../../_common/modal/confirm/confirm-service';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../../_common/route/route-component';
import { Screen } from '../../../../../../_common/screen/screen-service';
import { useThemeStore } from '../../../../../../_common/theme/theme.store';
import { $gettext } from '../../../../../../_common/translate/translate.service';
import { enforceLocation } from '../../../../../../utils/router';
import AppCommunityPerms from '../../../../../components/community/perms/AppCommunityPerms.vue';
import FormCommunity from '../../../../../components/forms/community/community.vue';
import FormCommunityDescription from '../../../../../components/forms/community/description/FormCommunityDescription.vue';
import { useGridStore } from '../../../../../components/grid/grid-store';
import { useAppStore } from '../../../../../store';
import { CommunityThemeKey } from '../../RouteCommunitiesView.vue';
import AppCommunitiesViewPageContainer from '../../_page-container/page-container.vue';
import { useCommunityRouteStore } from '../../view.store';

export default {
	...defineAppRouteOptions({}),
};
</script>

<script lang="ts" setup>
const routeStore = useCommunityRouteStore()!;
const { leaveCommunity } = useAppStore();
const { setPageTheme } = useThemeStore();
const { grid } = useGridStore();
const route = useRoute();
const router = useRouter();

/* The owner's collaboration is not returned from backend.*/ /* The owner's collaboration is not returned from backend.*/

const community = toRef(routeStore.community);
const collaborator = toRef(routeStore.collaborator);
const canEditDescription = toRef(routeStore.canEditDescription);
const isOwner = toRef(() => collaborator.value === null);

function onDetailsChange() {
	// If the community path changes, we need to replace the route,
	// otherwise when navigating to the community view routes, it'll attempt to navigate
	// to the old name.
	if (community.value.path !== route.params.path) {
		const newLocation = enforceLocation(route, { path: community.value.path });
		if (newLocation) {
			router.replace(newLocation.location);
		}
	}

	setPageTheme({
		key: CommunityThemeKey,
		theme: community.value.theme || null,
	});
}

async function removeCommunity() {
	const result = await showModalConfirm(
		$gettext(
			`Are you sure you want to permanently remove your community? Once it's gone, it's gone forever.`
		)
	);
	if (!result) {
		return;
	}

	await $removeCommunity(community.value);
	await leaveCommunity(community.value, { grid: grid.value, shouldConfirm: false });

	showInfoGrowl(
		$gettext(`Your community has been removed from the site.`),
		$gettext(`Community Removed`)
	);

	router.push({ name: 'home' });
}

async function performCommunityLeave() {
	if (!collaborator.value) {
		return;
	}

	const result = await showModalConfirm(
		$gettext(`Are you sure you want to leave this community?`),
		$gettext(`Leave community?`)
	);
	if (!result) {
		return;
	}

	await $removeCollaboratorInvite(collaborator.value);
	await leaveCommunity(community.value, { grid: grid.value, shouldConfirm: false });

	showSuccessGrowl(
		$gettext(`You left the community. You will be missed! ;A;`),
		$gettext(`Left Community`)
	);

	router.push({ name: 'home' });
}

createAppRoute({});
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
						{{ $gettext(`Welcome to your new community! 🎉`) }}
					</h2>

					<ul>
						<li>
							<p>
								<strong>
									{{ $gettext(`Your community is live!`) }}
								</strong>
								<br />
								{{
									$gettext(
										`Users can already see and join your community on Game Jolt.`
									)
								}}
							</p>
						</li>

						<li>
							<strong>
								{{ $gettext(`Customize the %$@#! out of it`) }}
							</strong>
							<br />

							{{
								$gettext(
									`You can edit every aspect of your community in this page. Set a description, upload a thumbnail and header, customize your channels - make it real pretty!`
								)
							}}
						</li>

						<li>
							<strong>
								{{ $gettext(`Assign moderators and collaborators`) }}
							</strong>
							<br />
							{{
								$gettext(
									`Invite others to help you moderate and contribute to your community.`
								)
							}}
						</li>

						<li>
							<strong>
								{{ $gettext(`Get Featured`) }}
							</strong>
							<br />
							{{
								$gettext(
									`Share your community with your friends, post about it on Reddit, Facebook, Twitter and Discord. Game Jolt staff will be looking for active communities to feature on the home page.`
								)
							}}
						</li>
					</ul>
				</AppAlertDismissable>

				<!-- Details -->
				<AppCommunityPerms :community="community" required="community-details">
					<h2 class="section-header">
						{{ $gettext(`Details`) }}
					</h2>

					<FormCommunity :model="community" @submit="onDetailsChange" />
					<div class="-spacer" />

					<template v-if="canEditDescription && Screen.isMobile">
						<h2 class="section-header">
							{{ $gettext(`Edit Description`) }}
						</h2>

						<FormCommunityDescription :model="community" />
						<div class="-spacer" />
					</template>
				</AppCommunityPerms>

				<!-- Leave/Remove Community -->
				<div class="-danger-zone well fill-offset">
					<template v-if="isOwner">
						<h2>
							{{ $gettext(`Remove Community`) }}
						</h2>

						<div class="page-help">
							<p>
								{{
									$gettext(
										`Removing your community will remove it from the site completely.`
									)
								}}
								<b>{{ $gettext(`This is permanent!`) }}</b>
							</p>
						</div>

						<AppButton @click="removeCommunity()">
							{{ $gettext(`Remove Community`) }}
						</AppButton>
					</template>
					<template v-else>
						<h2>
							{{ $gettext(`Leave Community`) }}
						</h2>

						<div class="page-help">
							<p>
								{{
									$gettext(
										`You are currently a moderator on this community. Leaving the community will revoke all of your moderation permissions.`
									)
								}}
							</p>
						</div>

						<AppButton @click="performCommunityLeave()">
							{{ $gettext(`Leave Community`) }}
						</AppButton>
					</template>
				</div>
			</template>

			<template v-if="canEditDescription && !Screen.isMobile" #sidebar>
				<h2 class="section-header">{{ $gettext(`Edit Description`) }}</h2>

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
