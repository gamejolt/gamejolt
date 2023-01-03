<script lang="ts">
import { computed, ref } from 'vue';
import { Api } from '../../../../_common/api/api.service';
import { CreatorReferral } from '../../../../_common/creator/referral/referral.model';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { AppTimeAgo } from '../../../../_common/time/ago/ago';
import { $gettext } from '../../../../_common/translate/translate.service';

const REFERRALS_PER_PAGE = 25;

export default {
	...defineAppRouteOptions({
		resolver: () =>
			Api.sendFieldsRequest(`/mobile/dash/creators/referral`, {
				referrals: {
					perPage: REFERRALS_PER_PAGE,
				},
			}),
	}),
};

type InitPayload = {
	referrals: any[];
};
</script>

<script lang="ts" setup>
const referrals = ref<CreatorReferral[]>([]);

createAppRoute({
	routeTitle: computed(() => $gettext(`Creator Referrals`)),
	onResolved(data) {
		const payload: InitPayload = data.payload;

		referrals.value = CreatorReferral.populate(payload.referrals);
	},
});
</script>

<template>
	<section class="section">
		<div class="container">
			<div v-for="referral of referrals" :key="referral.id">
				<div>
					User:
					{{ referral.user.username }}
				</div>
				<div>
					Completed:
					<AppTimeAgo :date="referral.completed_on" />
				</div>
				<div>
					Share:
					{{ referral.share_part * 100 }}%
				</div>
				<hr />
			</div>
		</div>
	</section>
</template>

<style lang="stylus" scoped></style>
