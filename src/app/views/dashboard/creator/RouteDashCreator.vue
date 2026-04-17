<script lang="ts">
import { computed, ref } from 'vue';
import { RouteParamsRaw, RouteRecordName } from 'vue-router';

import AppShellPageBackdrop from '~app/components/shell/AppShellPageBackdrop.vue';
import { routeDashAccountBlocks } from '~app/views/dashboard/account/blocks/blocks.route';
import { routeDashAccountReferrals } from '~app/views/dashboard/account/referrals/referrals.route';
import { routeDashAccountWallet } from '~app/views/dashboard/account/wallet/wallet.route';
import { routeDashAnalytics } from '~app/views/dashboard/analytics/analytics.route';
import { routeDashShopOverview } from '~app/views/dashboard/shop/overview/overview.route';
import { routeDashSupporters } from '~app/views/dashboard/supporters/supporters.route';
import { routeLandingCreators } from '~app/views/landing/creators/creators.route';
import {
	routeLandingHelpCategory,
	routeLandingHelpRedirect,
} from '~app/views/landing/help/help.route';
import { Api } from '~common/api/api.service';
import AppAspectRatio from '~common/aspect-ratio/AppAspectRatio.vue';
import { CreatorExperienceModel } from '~common/creator/experience/experience.model';
import { formatNumber } from '~common/filters/number';
import AppInviteCard from '~common/invite/AppInviteCard.vue';
import AppJolticon, { Jolticon } from '~common/jolticon/AppJolticon.vue';
import { ModelData } from '~common/model/model.service';
import AppCircularProgress from '~common/progress/AppCircularProgress.vue';
import { createAppRoute, defineAppRouteOptions } from '~common/route/route-component';
import AppSheetButton from '~common/sheet/AppSheetButton.vue';
import AppSpacer from '~common/spacer/AppSpacer.vue';
import { useCommonStore } from '~common/store/common-store';
import { kThemeFgMuted } from '~common/theme/variables';
import { $gettext } from '~common/translate/translate.service';
import { styleAbsoluteFill, styleFlexCenter } from '~styles/mixins';
import { kGridGutterWidth } from '~styles/variables';
import { RouteLocationRedirect } from '~utils/router';

export default {
	...defineAppRouteOptions({
		reloadOn: 'never',
		resolver: async () => {
			try {
				// TODO(brand-creators) Make sure this works with brand accounts
				// or change to something else.
				return await Api.sendFieldsRequest(
					`/mobile/me`,
					{ creatorExperience: true },
					{ noErrorRedirect: true }
				);
			} catch (error) {
				// Redirect away if the request fails.
				return new RouteLocationRedirect({
					name: routeLandingCreators.name,
				});
			}
		},
	}),
};

interface InitPayload {
	creatorExperience: ModelData<CreatorExperienceModel> | null;
}
</script>

<script lang="ts" setup>
const { user } = useCommonStore();

const experience = ref<CreatorExperienceModel | null>(null);

const { isBootstrapped } = createAppRoute({
	routeTitle: computed(() => $gettext(`Creator HUD`)),
	onResolved({ payload }: { payload: InitPayload }) {
		if (payload.creatorExperience) {
			experience.value = new CreatorExperienceModel(payload.creatorExperience);
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

const buttons = computed<Button[]>(() => {
	const buttons: Button[] = [];
	const isCreator = user.value?.is_creator === true;
	const isBrand = user.value?.is_brand === true;

	function addButton(condition: boolean, button: Button) {
		if (condition) {
			buttons.push(button);
		}
	}

	addButton(isCreator || isBrand, {
		to: routeDashShopOverview.name!,
		label: $gettext(`Your shop`),
		icon: 'marketplace-filled',
	});
	addButton(isCreator, {
		to: routeDashSupporters.name!,
		label: $gettext(`Supporters`),
		icon: 'heart-filled',
	});
	addButton(isCreator || isBrand, {
		to: routeDashAnalytics.name!,
		routeParams: {
			resource: 'User',
			resourceId: user.value?.id,
		},
		label: $gettext(`Analytics`),
		icon: 'chart',
	});
	addButton(isCreator, {
		to: routeDashAccountWallet.name!,
		label: $gettext(`Wallet`),
		icon: 'gem',
	});
	addButton(isCreator, {
		to: routeDashAccountReferrals.name!,
		label: $gettext(`Referrals`),
		icon: 'users',
	});
	addButton(isCreator, {
		to: routeDashAccountBlocks.name!,
		label: $gettext(`Blocked users`),
		icon: 'friend-remove-2',
	});
	addButton(isCreator || isBrand, {
		to: routeLandingHelpCategory.name!,
		routeParams: {
			category: 'creators',
		},
		label: $gettext(`Help and FAQs`),
		icon: 'help-circle',
	});

	return buttons;
});

const creatorNextUnlock = computed(() => {
	if (experience.value) {
		return experience.value.ability_on_level_up_display;
	}
	return null;
});
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

				<template v-if="experience && user.is_creator">
					<div :style="styleFlexCenter({ direction: `column` })">
						<div
							:style="{
								width: `120px`,
							}"
						>
							<AppAspectRatio :ratio="1" show-overflow>
								<div
									:style="{
										...styleFlexCenter({
											direction: `column`,
										}),
										width: `100%`,
										height: `100%`,
										position: `relative`,
									}"
								>
									<div>{{ experience.current_level }}</div>
									<div>{{ $gettext(`level`) }}</div>

									<AppCircularProgress
										:style="styleAbsoluteFill()"
										:percent="
											Math.min(
												1,
												Math.max(
													0,
													experience.current_level_xp /
														experience.current_level_xp_required
												)
											)
										"
										:stroke-width="8"
									/>
								</div>
							</AppAspectRatio>
						</div>

						<AppSpacer vertical :scale="2" />
						<template v-if="experience.is_max_level">
							<div :style="{ color: kThemeFgMuted }">
								{{ $gettext(`You've reached the max level... for now.`) }}
							</div>

							<div>
								{{ $gettext(`Check back later for more rewards!`) }}
							</div>
						</template>
						<template v-else>
							<div :style="{ color: kThemeFgMuted }">
								{{
									`${formatNumber(experience.current_level_xp)}/${formatNumber(
										experience.current_level_xp_required
									)} EXP`
								}}
							</div>

							<div v-if="creatorNextUnlock">
								{{ $gettext(`Next unlock`) }}:
								<span>
									{{ creatorNextUnlock }}
								</span>
							</div>
						</template>
						<AppSpacer vertical :scale="4" />

						<RouterLink
							class="link-help"
							:to="{
								name: routeLandingHelpRedirect.name,
								params: { path: 'creator-levels' },
							}"
						>
							{{ $gettext(`Learn how creator leveling works`) }}
						</RouterLink>
					</div>
				</template>

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
</style>
