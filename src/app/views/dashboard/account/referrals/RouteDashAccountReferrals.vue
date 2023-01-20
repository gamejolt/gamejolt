<script lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { Api } from '../../../../../_common/api/api.service';
import { formatDate } from '../../../../../_common/filters/date';
import { formatNumber } from '../../../../../_common/filters/number';
import AppInviteCard from '../../../../../_common/invite/AppInviteCard.vue';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
import AppSpacer from '../../../../../_common/spacer/AppSpacer.vue';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { $gettext } from '../../../../../_common/translate/translate.service';
import AppUserAvatarImg from '../../../../../_common/user/user-avatar/AppUserAvatarImg.vue';
import { User } from '../../../../../_common/user/user.model';
import { styleTextOverflow } from '../../../../../_styles/mixins';
import { kFontSizeLarge } from '../../../../../_styles/variables';
import AppShellPageBackdrop from '../../../../components/shell/AppShellPageBackdrop.vue';
import { imageGems } from '../../../../img/images';
import { useAccountRouteController } from '../RouteDashAccount.vue';

export default {
	...defineAppRouteOptions({
		deps: {},
		resolver: () =>
			Api.sendFieldsRequest('/mobile/dash/creators/referral', {
				referrals: true,
			}),
	}),
};
</script>

<script lang="ts" setup>
interface EarnedRevenue {
	currency: string;
	amount: number;
}

interface ReferralData {
	id: number;
	share_part: number;
	share_time_finished: boolean;
	start_time: number;
	user: User;
	earned_revenue: EarnedRevenue[];
}

const { heading } = useAccountRouteController()!;
const { user } = useCommonStore();

const referrals = ref<ReferralData[]>([]);

const routeTitle = computed(() => $gettext(`Referrals`));

const { isBootstrapped } = createAppRoute({
	routeTitle,
	onInit() {
		heading.value = routeTitle.value;
	},
	onResolved({ payload }) {
		if (payload.referrals) {
			for (const referral of payload.referrals) {
				referrals.value.push({
					id: referral.id,
					share_part: referral.share_part,
					start_time: referral.start_time,
					user: new User(referral.user),
					share_time_finished: referral.share_time_finished,
					earned_revenue: referral.earned_revenue,
				});
			}
		}
	},
});

function getEarnedGems(referral: ReferralData) {
	return referral.earned_revenue.find(x => x.currency === '$GEM')?.amount || 0;
}
</script>

<template>
	<AppShellPageBackdrop v-if="isBootstrapped && user">
		<div class="row">
			<div class="col-sm-7">
				<h3 :style="{ marginTop: 0 }">
					{{ $gettext(`How referrals work`) }}
				</h3>
				<p>
					{{
						$gettext(
							`Invite a new creator to sign up for Game Jolt using your invite link. If they apply to become a Game Jolt creator and their application is accepted, you'll get a bonus in gems deposited to your wallet!`
						)
					}}
				</p>

				<p>
					{{
						$gettext(
							`Each day we'll give you a bonus based on the amount of revenue your friend has made. We'll match a percentage of their earnings for the first three months, so the more active and successful they are, the more you'll earn. (Up to 5% for the first 30 days, up to 10% for the next 30, and up to 15% for the next 30)`
						)
					}}
				</p>
			</div>
			<div class="col-sm-5">
				<AppInviteCard :user="user" elevate />
			</div>
		</div>

		<AppSpacer vertical :scale="4" />

		<template v-if="!referrals.length">
			<div class="col-md-6 col-centered">
				<p class="lead text-center">
					{{ $gettext(`You haven't referred anyone yet. Share your invite link!`) }}
				</p>
			</div>
		</template>
		<template v-else>
			<template v-for="referral of referrals" :key="referral.id">
				<div
					class="_referral sheet sheet-elevate"
					:style="{
						display: `flex`,
						gridGap: `64px`,
					}"
				>
					<!-- user info -->
					<RouterLink
						:style="{
							flex: 2,
							display: `flex`,
							gridGap: `16px`,
							alignItems: `center`,
							fontWeight: `bold`,
							color: `inherit`,
							overflow: `hidden`,
						}"
						:to="referral.user.routeLocation"
					>
						<div
							:style="{
								width: `64px`,
								flex: `none`,
							}"
						>
							<AppUserAvatarImg :user="referral.user" />
						</div>

						<div
							class="_user-info"
							:style="{
								flex: `auto`,
								overflow: `hidden`,
							}"
						>
							<div
								:style="{
									...styleTextOverflow,
									minWidth: 0,
									maxWidth: `100%`,
									fontWeight: `bold`,
									fontSize: kFontSizeLarge.px,
								}"
							>
								@{{ referral.user.username }}
							</div>
						</div>
					</RouterLink>

					<!-- referral info -->
					<div class="stat-big" :style="{ flex: 1 }">
						<div class="stat-big-label">
							{{ $gettext(`Joined on`) }}
						</div>
						<div class="stat-big-digit">
							{{ formatDate(referral.start_time, 'mediumDate') }}
						</div>
					</div>

					<div :style="{ flex: 1 }">
						<div class="stat-big">
							<div class="stat-big-label">
								{{ $gettext(`Current bonus`) }}
							</div>
							<div class="stat-big-digit">
								<template v-if="referral.share_time_finished">
									{{ $gettext(`Completed`) }}
									<AppJolticon
										v-app-tooltip="
											$gettext(`The 90 day referral period has ended.`)
										"
										class="text-muted"
										icon="help-circle"
									/>
								</template>
								<template v-else>{{ referral.share_part * 100 }}%</template>
							</div>
						</div>
					</div>

					<div class="stat-big" :style="{ flex: 1 }">
						<div class="stat-big-label">
							{{ $gettext(`Gems earned`) }}
						</div>
						<div class="stat-big-digit">
							<img :src="imageGems" width="24" height="24" alt="Gems" />
							{{ formatNumber(getEarnedGems(referral)) }}
						</div>
					</div>
				</div>

				<AppSpacer vertical :scale="8" />
			</template>
		</template>
	</AppShellPageBackdrop>
</template>

<style lang="stylus" scoped>
@media $media-mobile
	._referral
		flex-direction: column
		grid-gap: 12px !important
</style>
