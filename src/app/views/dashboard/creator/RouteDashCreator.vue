<script lang="ts">
import { computed } from 'vue';
import { RouteParamsRaw, RouteRecordName, RouterLink } from 'vue-router';
import AppJolticon, { Jolticon } from '../../../../_common/jolticon/AppJolticon.vue';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { useCommonStore } from '../../../../_common/store/common-store';
import { $gettext } from '../../../../_common/translate/translate.service';
import { User } from '../../../../_common/user/user.model';
import { routeDashAccountBlocks } from '../account/blocks/blocks.route';
import { routeDashAccountChatCommands } from '../account/chat-commands/chat-commands.route';
import { routeDashAccountChatTimers } from '../account/chat-timers/chat-timers.route';
import { routeDashAccountWallet } from '../account/wallet/wallet.route';
import { routeDashAnalytics } from '../analytics/analytics.route';
import { routeDashSupporters } from '../supporters/supporters.route';

export default {
	...defineAppRouteOptions({
		resolver: async () => User.touch(),
	}),
};
</script>

<script lang="ts" setup>
const { user } = useCommonStore();

createAppRoute({
	routeTitle: computed(() => $gettext(`Creator HUD`)),
});

interface Button {
	to: RouteRecordName;
	label: string;
	icon: Jolticon;
	routeParams?: RouteParamsRaw;
}

const buttons = computed<Button[]>(() => [
	{
		to: routeDashSupporters.name!,
		label: $gettext(`Supporters`),
		icon: 'heart-filled',
	},
	{
		to: routeDashAnalytics.name!,
		routeParams: {
			resource: 'User',
			resourceId: user.value?.id,
		},
		label: $gettext(`Analytics`),
		icon: 'chart',
	},
	{
		to: routeDashAccountWallet.name!,
		label: $gettext(`Wallet`),
		icon: 'gem',
	},
	{
		to: routeDashAccountChatCommands.name!,
		label: $gettext(`Chat commands`),
		icon: 'wand',
	},
	{
		to: routeDashAccountChatTimers.name!,
		label: $gettext(`Chat timers`),
		icon: 'timer',
	},
	{
		to: routeDashAccountBlocks.name!,
		label: $gettext(`Blocked users`),
		icon: 'friend-remove-2',
	},
]);
</script>

<template>
	<section class="section">
		<div class="container">
			<div class="-buttons">
				<RouterLink
					v-for="{ to, routeParams, label, icon } of buttons"
					:key="to"
					class="-button"
					:to="{ name: to, params: routeParams }"
				>
					<div class="-button-text">{{ label }}</div>
					<div class="-spacer" />
					<AppJolticon class="-button-icon" :icon="icon" />
				</RouterLink>
			</div>
		</div>
	</section>
</template>

<style lang="stylus" scoped>
.-buttons
	display: grid
	grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))
	gap: $grid-gutter-width

.-button
	rounded-corners-lg()
	display: flex
	flex-direction: column
	height: 150px
	padding: 16px
	background-color: var(--theme-bi-bg)
	color: var(--theme-bi-fg)

.-button-text
	font-weight: bold
	font-size: $font-size-large

.-spacer
	flex: auto

.-button-icon
	font-size: 40px
</style>
