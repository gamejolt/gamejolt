<script lang="ts">
import { computed, ref } from 'vue';
import { RouteParamsRaw, RouteRecordName } from 'vue-router';
import { Api } from '../../../../_common/api/api.service';
import AppCreatorExperienceBar from '../../../../_common/creator/experience/AppCreatorExperienceBar.vue';
import { CreatorExperience } from '../../../../_common/creator/experience/experience.model';
import AppInviteCard from '../../../../_common/invite/AppInviteCard.vue';
import AppJolticon, { Jolticon } from '../../../../_common/jolticon/AppJolticon.vue';
import { ModelData } from '../../../../_common/model/model.service';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import AppSheetButton from '../../../../_common/sheet/AppSheetButton.vue';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import { useCommonStore } from '../../../../_common/store/common-store';
import { $gettext } from '../../../../_common/translate/translate.service';
import { kGridGutterWidth } from '../../../../_styles/variables';
import { RouteLocationRedirect } from '../../../../utils/router';
import AppShellPageBackdrop from '../../../components/shell/AppShellPageBackdrop.vue';
import { routeLandingCreators } from '../../landing/creators/creators.route';
import { routeLandingHelpCategory } from '../../landing/help/help.route';
import { routeDashAccountBlocks } from '../account/blocks/blocks.route';
import { routeDashAccountChatCommands } from '../account/chat-commands/chat-commands.route';
import { routeDashAccountChatTimers } from '../account/chat-timers/chat-timers.route';
import { routeDashAccountReferrals } from '../account/referrals/referrals.route';
import { routeDashAccountWallet } from '../account/wallet/wallet.route';
import { routeDashAnalytics } from '../analytics/analytics.route';
import { routeDashStickers } from '../stickers/stickers.route';
import { routeDashSupporters } from '../supporters/supporters.route';

export default {
	...defineAppRouteOptions({
		resolver: async () => {
			try {
				return await Api.sendRequest(`/web/dash/creators`, undefined, {
					noErrorRedirect: true,
				});
			} catch (error) {
				// TODO: if forbidden, go to creator landing. if unauth, go to login with redirect to here. otherwise, go to dash with error message (creator, but we broke).
				// Redirect away if no permissions.
				return new RouteLocationRedirect({
					name: routeLandingCreators.name,
				});
			}
		},
	}),
};

interface InitPayload {
	experience: ModelData<CreatorExperience> | null;
}
</script>

<script lang="ts" setup>
const { user } = useCommonStore();

const experience = ref<CreatorExperience | null>(null);

const { isBootstrapped } = createAppRoute({
	routeTitle: computed(() => $gettext(`Creator HUD`)),
	onResolved({ payload }: { payload: InitPayload }) {
		if (payload.experience) {
			experience.value = new CreatorExperience(payload.experience);
		} else {
			experience.value = null;
		}
	},
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
		to: routeDashStickers.name!,
		label: $gettext(`Custom stickers`),
		icon: 'sticker-filled',
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
	<AppShellPageBackdrop v-if="user && isBootstrapped">
		<section class="section">
			<div class="container">
				<h1 class="text-center _heading">
					<span :style="{ marginRight: `8px` }">
						<AppJolticon icon="dashboard" big middle />
					</span>
					{{ $gettext(`Creator HUD`) }}
				</h1>

				<div v-if="experience" :style="{ display: 'flex', justifyContent: 'center' }">
					<div class="fill-bg _level-container full-bleed-xs">
						<AppCreatorExperienceBar
							:level="experience.current_level"
							:xp="experience.current_level_xp"
							:required-xp="experience.current_level_xp_required"
							:is-max-level="experience.is_max_level"
						/>
					</div>
				</div>

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

<style lang="stylus" scoped>
._heading
	margin-top: 0
	margin-bottom: 32px

	@media $media-mobile
		margin-bottom: 20px

._level-container
	max-width: 640px
	flex-grow: 1
	padding: 10px

	@media $media-md-up
		rounded-corners-lg()
		elevate-1()
</style>
