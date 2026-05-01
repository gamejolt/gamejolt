<script lang="ts">
import { useRoute } from 'vue-router';

import FormProfile from '~app/components/forms/profile/FormProfile.vue';
import { showUserAvatarModal } from '~app/components/user/avatar-modal/avatar-modal.service';
import { useAccountRouteController } from '~app/views/dashboard/account/RouteDashAccount.vue';
import { showSuccessGrowl } from '~common/growls/growls.service';
import { createAppRoute, defineAppRouteOptions } from '~common/route/route-component';
import { scrollTo } from '~common/scroll/scroll.service';
import { useCommonStore } from '~common/store/common-store';
import { $gettext } from '~common/translate/translate.service';
import { bangRef } from '~utils/vue';

export default {
	...defineAppRouteOptions({
		reloadOn: 'never',
	}),
};
</script>

<script lang="ts" setup>
const { heading } = useAccountRouteController()!;
const { user: maybeUser } = useCommonStore();

const user = bangRef(maybeUser);
const route = useRoute();

createAppRoute({
	onInit() {
		heading.value = $gettext(`Edit Your Profile`);
		if (route.query.avatar) {
			showEditAvatar();
		}
	},
});

function showEditAvatar() {
	showUserAvatarModal();
}

function onProfileSaved() {
	showSuccessGrowl($gettext(`Your profile has been updated. Right on!`));
	scrollTo(0);
}
</script>

<template>
	<div class="row">
		<div class="col-md-9 col-lg-8">
			<FormProfile :user="user" @submit="onProfileSaved" />
		</div>
	</div>
</template>
