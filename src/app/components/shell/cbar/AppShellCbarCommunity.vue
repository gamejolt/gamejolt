<script lang="ts" setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

import AppCommunityPerms from '~app/components/community/perms/AppCommunityPerms.vue';
import { useGridStore } from '~app/components/grid/grid-store';
import AppShellCbarItem from '~app/components/shell/cbar/AppShellCbarItem.vue';
import { useAppStore } from '~app/store';
import { trackGotoCommunity } from '~common/analytics/analytics.service';
import { CommunityModel } from '~common/community/community.model';
import AppCommunityThumbnailImg from '~common/community/thumbnail/AppCommunityThumbnailImg.vue';
import { BaseUrl } from '~common/environment/environment.service';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import { Navigate } from '~common/navigate/navigate.service';
import AppPopper from '~common/popper/AppPopper.vue';
import { hideAllPoppers } from '~common/popper/popper.service';
import { useSidebarStore } from '~common/sidebar/sidebar.store';
import { useCommonStore } from '~common/store/common-store';
import { useThemeStore } from '~common/theme/theme.store';
import { vAppTooltip } from '~common/tooltip/tooltip-directive';
import AppTranslate from '~common/translate/AppTranslate.vue';

type Props = {
	community: CommunityModel;
};
const { community } = defineProps<Props>();
const { activeCommunity, communityStates, leaveCommunity, joinCommunity, toggleLeftPane } =
	useAppStore();
const { user } = useCommonStore();
const { grid } = useGridStore();
const { userTheme } = useThemeStore();
const { showContextOnRouteChange } = useSidebarStore();

const communityState = computed(() => communityStates.value.getCommunityState(community));

const isUnread = computed(() => communityState.value.isUnread);
const isActive = computed(() => activeCommunity.value?.id === community.id);

const highlight = computed(() => {
	if (isActive.value) {
		const theme = community.theme || userTheme.value;
		if (theme) {
			return '#' + theme.darkHighlight_;
		}
	}
	return undefined;
});

const shouldShowModerate = computed(() => user.value && user.value.isMod);
const shouldShowLeave = computed(() => !community.hasPerms() && !!community.is_member);
const shouldShowJoin = computed(() => !community.is_member);

async function onLeaveCommunityClick() {
	hideAllPoppers();
	await leaveCommunity(community, {
		grid: grid.value,
		location: 'cbar',
		shouldConfirm: true,
	});
}

async function onJoinCommunityClick() {
	hideAllPoppers();
	await joinCommunity(community, { grid: grid.value, location: 'cbar' });
}

function onCommunityClick(event: Event) {
	if (isActive.value) {
		toggleLeftPane('context');

		// Prevent the click from triggering a route change.
		event.preventDefault();
	} else {
		showContextOnRouteChange(true);
	}
}

function onGotoCommunity() {
	trackGotoCommunity({ source: 'cbar', id: community.id, path: community.path });
}

function gotoModerate() {
	hideAllPoppers();
	Navigate.newWindow(BaseUrl + `/moderate/communities/view/${community.id}`);
}
</script>

<template>
	<div>
		<AppPopper
			popover-class="fill-darkest"
			trigger="right-click"
			placement="right"
			fixed
			block
			hide-on-state-change
		>
			<template #default="{ isShowingPopper }">
				<div @click.capture="onCommunityClick">
					<AppShellCbarItem
						class="-community"
						:is-active="isActive"
						:is-unread="isUnread"
						:highlight="highlight"
					>
						<RouterLink
							v-app-tooltip.right="!isShowingPopper ? community.name : undefined"
							class="-link link-unstyled"
							:to="{
								name: 'communities.view.overview',
								params: { path: community.path },
							}"
							@click="onGotoCommunity"
						>
							<AppCommunityThumbnailImg class="-thumb" :community="community" />
						</RouterLink>
					</AppShellCbarItem>
				</div>
			</template>

			<template #popover>
				<div class="list-group list-group-dark">
					<AppCommunityPerms :community="community">
						<RouterLink
							class="list-group-item has-icon"
							:to="community.routeEditLocation"
						>
							<AppJolticon icon="edit" />
							<AppTranslate>Edit Community</AppTranslate>
						</RouterLink>
					</AppCommunityPerms>
					<a
						v-if="shouldShowLeave"
						class="list-group-item has-icon"
						@click="onLeaveCommunityClick"
					>
						<AppJolticon icon="remove" notice />
						<AppTranslate>Leave Community</AppTranslate>
					</a>
					<a
						v-else-if="shouldShowJoin"
						class="list-group-item has-icon"
						@click="onJoinCommunityClick"
					>
						<AppJolticon icon="add" notice />
						<AppTranslate>Join Community</AppTranslate>
					</a>
					<a
						v-if="shouldShowModerate"
						class="list-group-item has-icon"
						@click="gotoModerate"
					>
						<AppJolticon icon="cog" />
						<AppTranslate>Moderate Community</AppTranslate>
					</a>
				</div>
			</template>
		</AppPopper>

		<hr v-if="!community.is_member" class="-hr" />
	</div>
</template>

<style lang="stylus" scoped>
@import './common'

.-community
	pressy()

.-backdrop
	change-bg('dark')

.-notice
	theme-prop('color', 'notice')
</style>
