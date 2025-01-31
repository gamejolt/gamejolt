<script lang="ts" setup>
import { computed } from 'vue';
import { RouteLocationRaw, RouterLink } from 'vue-router';
import { trackHomeFeedSwitch } from '../../../_common/analytics/analytics.service';
import { Screen } from '../../../_common/screen/screen-service';
import { kThemeBg, kThemeBiBg, kThemeBiFg, kThemeNotice } from '../../../_common/theme/variables';
import { $gettext } from '../../../_common/translate/translate.service';
import { styleBorderRadiusLg, styleWhen } from '../../../_styles/mixins';
import { kBorderWidthLg } from '../../../_styles/variables';
import { assertNever } from '../../../utils/utils';
import { useAppStore } from '../../store';
import { HomeFeedService, HomeFeedTabTypes as HomeFeedTabType } from './home-feed.service';

type Props = {
	tabs: HomeFeedTabType[];
	activeTab: string;
};

const { tabs } = defineProps<Props>();

const { unreadActivityCount } = useAppStore();

const tabData = computed<
	{
		tab: HomeFeedTabType;
		to: RouteLocationRaw;
		label: string;
		unread: boolean;
	}[]
>(() =>
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
				};

			case 'fyp':
				return {
					tab,
					to: {
						name: 'home',
						params: { tab: HomeFeedService.fypTab },
					},
					label: $gettext(`For You`),
					unread: false,
				};

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
				class="pressy"
				:style="{
					...styleBorderRadiusLg,
					display: `flex`,
					alignItems: `center`,
					padding: `8px 20px`,
					fontWeight: 700,
					textAlign: `center`,
					backgroundColor: kThemeBg,
					borderWidth: kBorderWidthLg.px,
					borderStyle: `solid`,
					...styleWhen(activeTab === tab, {
						backgroundColor: kThemeBiBg,
						borderColor: kThemeBiFg,
						color: kThemeBiFg,
					}),
					...styleWhen(Screen.isMobile, {
						display: `block`,
						width: `100%`,
					}),
				}"
				@click.capture="onTabClick(tab, activeTab === tab)"
			>
				{{ label }}

				<span
					v-if="unread"
					class="anim-fade-in anim-fade-leave"
					:style="{
						backgroundColor: kThemeNotice,
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
