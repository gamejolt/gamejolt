<script lang="ts" setup>
import { computed, PropType, ref, toRefs } from 'vue';
import { RouterLink } from 'vue-router';
import { trackGotoCommunity } from '../../../../_common/analytics/analytics.service';
import { Community } from '../../../../_common/community/community.model';
import AppCommunityThumbnailImg from '../../../../_common/community/thumbnail/AppCommunityThumbnailImg.vue';
import { Environment } from '../../../../_common/environment/environment.service';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import { Navigate } from '../../../../_common/navigate/navigate.service';
import AppPopper from '../../../../_common/popper/AppPopper.vue';
import { Popper } from '../../../../_common/popper/popper.service';
import { useSidebarStore } from '../../../../_common/sidebar/sidebar.store';
import { useCommonStore } from '../../../../_common/store/common-store';
import { useThemeStore } from '../../../../_common/theme/theme.store';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { useAppStore } from '../../../store';
import { AppCommunityPerms } from '../../community/perms/perms';
import { useGridStore } from '../../grid/grid-store';
import AppShellCbarItem from './AppShellCbarItem.vue';

const props = defineProps({
	community: {
		type: Object as PropType<Community>,
		required: true,
	},
});

const { community } = toRefs(props);
const { activeCommunity, communityStates, leaveCommunity, joinCommunity, toggleLeftPane } =
	useAppStore();
const { user } = useCommonStore();
const { grid } = useGridStore();
const { userTheme } = useThemeStore();
const { showContextOnRouteChange } = useSidebarStore();

const popperVisible = ref(false);

const communityState = computed(() => communityStates.value.getCommunityState(community.value));

const isUnread = computed(() => communityState.value.isUnread);
const isActive = computed(() => activeCommunity.value?.id === community.value.id);

const highlight = computed(() => {
	if (isActive.value) {
		const theme = community.value.theme || userTheme.value;
		if (theme) {
			return '#' + theme.darkHighlight_;
		}
	}
	return undefined;
});

// Don't show the tooltip if the right click popper is visible.
const tooltip = computed(() => (popperVisible.value ? '' : community.value.name));

const shouldShowModerate = computed(() => user.value && user.value.isMod);
const shouldShowLeave = computed(() => !community.value.hasPerms() && !!community.value.is_member);
const shouldShowJoin = computed(() => !community.value.is_member);

async function onLeaveCommunityClick() {
	Popper.hideAll();
	await leaveCommunity(community.value, {
		grid: grid.value,
		location: 'cbar',
		shouldConfirm: true,
	});
}

async function onJoinCommunityClick() {
	Popper.hideAll();
	await joinCommunity(community.value, { grid: grid.value, location: 'cbar' });
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
	trackGotoCommunity({ source: 'cbar', id: community.value.id, path: community.value.path });
}

function gotoModerate() {
	Popper.hideAll();
	Navigate.newWindow(Environment.baseUrl + `/moderate/communities/view/${community.value.id}`);
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
			@show="popperVisible = true"
			@hide="popperVisible = false"
		>
			<template #default>
				<div @click.capture="onCommunityClick">
					<AppShellCbarItem
						class="-community"
						:is-active="isActive"
						:is-unread="isUnread"
						:highlight="highlight"
					>
						<RouterLink
							v-app-tooltip.right="tooltip"
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
