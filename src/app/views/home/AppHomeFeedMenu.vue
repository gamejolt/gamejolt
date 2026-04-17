<script lang="ts" setup>
import { computed } from 'vue';
import { RouteLocationRaw, RouterLink } from 'vue-router';

import { useAppStore } from '~app/store';
import {
	HomeFeedService,
	HomeFeedTabTypes as HomeFeedTabType,
} from '~app/views/home/home-feed.service';
import { trackHomeFeedSwitch } from '~common/analytics/analytics.service';
import { Screen } from '~common/screen/screen-service';
import { kThemeBg, kThemeBiBg, kThemeBiFg, kThemeGjOverlayNotice } from '~common/theme/variables';
import { $gettext } from '~common/translate/translate.service';
import { kBorderWidthLg } from '~styles/variables';
import { assertNever } from '~utils/utils';

type Props = {
	tabs: HomeFeedTabType[];
	activeTab: string;
};

const { tabs } = defineProps<Props>();

const { unreadActivityCount } = useAppStore();

type Tab = {
	tab: HomeFeedTabType;
	to: RouteLocationRaw;
	label: string;
	unread: boolean;
};

const tabData = computed(() =>
	tabs.map(tab => {
		switch (tab) {
			case 'activity':
				return {
					tab,
					to: {
						name: 'home',
						params: { tab: HomeFeedService.activityTab },
					},
					label: $gettext(`Following`),
					unread: unreadActivityCount.value > 0,
				} satisfies Tab;

			case 'fyp':
				return {
					tab,
					to: {
						name: 'home',
						params: { tab: HomeFeedService.fypTab },
					},
					label: $gettext(`For You`),
					unread: false,
				} satisfies Tab;

			default:
				assertNever(tab);
		}
	})
);

function onTabClick(path: string, isActive: boolean) {
	trackHomeFeedSwitch({
		path,
		isActive,
	});
}
</script>

<template>
	<nav
		:style="{
			display: `flex`,
			gap: `20px`,
			justifyContent: `center`,
			marginBottom: `20px`,
		}"
	>
		<template v-for="{ tab, to, label, unread } of tabData" :key="tab">
			<RouterLink
				:to
				class="pressy rounded-lg"
				:style="{
					position: `relative`,
					display: Screen.isMobile ? `block` : `flex`,
					alignItems: `center`,
					padding: `8px 20px`,
					fontWeight: 700,
					textAlign: `center`,
					backgroundColor: activeTab === tab ? kThemeBiBg : kThemeBg,
					borderWidth: kBorderWidthLg.px,
					borderStyle: `solid`,
					borderColor: activeTab === tab ? kThemeBiFg : undefined,
					color: activeTab === tab ? kThemeBiFg : undefined,
					width: Screen.isMobile ? `100%` : undefined,
				}"
				@click.capture="onTabClick(tab, activeTab === tab)"
			>
				{{ label }}

				<span
					v-if="unread"
					class="anim-fade-in anim-fade-leave shadow-elevate-xs elevate-transition"
					:style="{
						position: `absolute`,
						top: `-3px`,
						right: `-3px`,
						backgroundColor: kThemeGjOverlayNotice,
						borderRadius: `50%`,
						width: `12px`,
						height: `12px`,
						display: `block`,
						marginLeft: `8px`,
					}"
				/>
			</RouterLink>
		</template>
	</nav>
</template>
