<script lang="ts">
import { computed } from 'vue';
import { RouteParamsRaw, RouteRecordName } from 'vue-router';
import AppInviteCard from '../../../../_common/invite/AppInviteCard.vue';
import AppJolticon, { Jolticon } from '../../../../_common/jolticon/AppJolticon.vue';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import AppSheetButton from '../../../../_common/sheet/AppSheetButton.vue';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import { useCommonStore } from '../../../../_common/store/common-store';
import { $gettext } from '../../../../_common/translate/translate.service';
import { User } from '../../../../_common/user/user.model';
import { kGridGutterWidth } from '../../../../_styles/variables';
import AppShellPageBackdrop from '../../../components/shell/AppShellPageBackdrop.vue';
import { routeLandingHelpCategory } from '../../landing/help/help.route';
import { routeDashAccountBlocks } from '../account/blocks/blocks.route';
import { routeDashAccountChatCommands } from '../account/chat-commands/chat-commands.route';
import { routeDashAccountChatTimers } from '../account/chat-timers/chat-timers.route';
import { routeDashAccountReferrals } from '../account/referrals/referrals.route';
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
		to: routeDashAccountReferrals.name!,
		label: $gettext(`Referrals`),
		icon: 'users',
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
	{
		to: routeLandingHelpCategory.name!,
		routeParams: {
			category: 'creators',
		},
		label: $gettext(`Help and FAQs`),
		icon: 'help-circle',
	},
]);
</script>

<template>
	<AppShellPageBackdrop v-if="user">
		<section class="section">
			<div class="container">
				<h1 class="text-center">
					<span :style="{ marginRight: `8px` }">
						<AppJolticon icon="dashboard" big middle />
					</span>
					{{ $gettext(`Creator HUD`) }}
				</h1>

				<AppSpacer vertical :scale="10" />

				<div
					:style="{
						display: `grid`,
						gridTemplateColumns: `repeat(auto-fill, minmax(200px, 1fr))`,
						gap: kGridGutterWidth.px,
					}"
				>
					<template v-for="{ to, routeParams, label, icon } of buttons" :key="to">
						<AppSheetButton :to="{ name: to, params: routeParams }" :icon="icon">
							{{ label }}
						</AppSheetButton>
					</template>
				</div>

				<AppSpacer vertical :scale="10" />

				<div class="row">
					<div class="col-sm-8 col-md-6 col-centered">
						<AppInviteCard :user="user" elevate />
					</div>
				</div>
			</div>
		</section>
	</AppShellPageBackdrop>
</template>
