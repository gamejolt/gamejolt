<script lang="ts">
import { computed } from 'vue';
import { RouteParamsRaw, RouteRecordName, RouterLink } from 'vue-router';
import AppInviteCard from '../../../../_common/invite/AppInviteCard.vue';
import AppJolticon, { Jolticon } from '../../../../_common/jolticon/AppJolticon.vue';
import AppOnHover from '../../../../_common/on/AppOnHover.vue';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import { useCommonStore } from '../../../../_common/store/common-store';
import { kThemeBg, kThemeBiBg, kThemeBiFg, kThemeFg } from '../../../../_common/theme/variables';
import { $gettext } from '../../../../_common/translate/translate.service';
import { User } from '../../../../_common/user/user.model';
import { styleBorderRadiusLg, styleWhen } from '../../../../_styles/mixins';
import { kFontSizeLarge, kGridGutterWidth } from '../../../../_styles/variables';
import AppShellPageBackdrop from '../../../components/shell/AppShellPageBackdrop.vue';
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
						<AppOnHover v-slot="{ binding, hovered }">
							<RouterLink
								v-bind="binding"
								class="elevate-1"
								:style="{
									...styleBorderRadiusLg,
									display: `flex`,
									flexDirection: `column`,
									height: `150px`,
									padding: `16px`,
									backgroundColor: kThemeBg,
									color: kThemeFg,
									...styleWhen(hovered, {
										backgroundColor: kThemeBiBg,
										color: kThemeBiFg,
									}),
								}"
								:to="{ name: to, params: routeParams }"
							>
								<div
									:style="{
										fontWeight: `bold`,
										fontSize: kFontSizeLarge.px,
									}"
								>
									{{ label }}
								</div>
								<div :style="{ flex: `auto` }" />
								<AppJolticon :style="{ fontSize: `40px` }" :icon="icon" />
							</RouterLink>
						</AppOnHover>
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
