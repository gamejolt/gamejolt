<script lang="ts">
import { computed, ref } from 'vue';
import { Api } from '../../../../_common/api/api.service';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { $gettext } from '../../../../_common/translate/translate.service';
import { UserInvite } from '../../../../_common/user/invite/invite.model';

const INVITES_PER_PAGE = 25;

export default {
	...defineAppRouteOptions({
		resolver: () =>
			Api.sendFieldsRequest(`/mobile/dash/creators/invite`, {
				list: {
					perPage: INVITES_PER_PAGE,
				},
			}),
	}),
};

type InitPayload = {
	list: any[];
};
</script>

<script lang="ts" setup>
const invites = ref<UserInvite[]>([]);

createAppRoute({
	routeTitle: computed(() => $gettext(`Creator Referrals`)),
	onResolved(data) {
		const payload: InitPayload = data.payload;

		invites.value = UserInvite.populate(payload.list);
	},
});
</script>

<template>
	<section class="section">
		<div class="container">
			<div v-for="invite of invites" :key="invite.id">
				{{ invite.inviter_user.username }}
				{{ invite.invited_user.username }}
			</div>
		</div>
	</section>
</template>

<style lang="stylus" scoped></style>
