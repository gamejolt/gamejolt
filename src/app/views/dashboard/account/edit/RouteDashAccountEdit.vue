<script lang="ts">
import { useRoute } from 'vue-router';
import { showSuccessGrowl } from '../../../../../_common/growls/growls.service';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
import { Scroll } from '../../../../../_common/scroll/scroll.service';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { bangRef } from '../../../../../utils/vue';
import FormProfile from '../../../../components/forms/profile/FormProfile.vue';
import { UserAvatarModal } from '../../../../components/user/avatar-modal/avatar-modal.service';
import { useAccountRouteController } from '../RouteDashAccount.vue';

export default {
	...defineAppRouteOptions({
		deps: {},
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
	UserAvatarModal.show();
}

function onProfileSaved() {
	showSuccessGrowl($gettext(`Your profile has been updated. Right on!`));
	Scroll.to(0);
}
</script>

<template>
	<div class="row">
		<div class="col-md-9 col-lg-8">
			<FormProfile :user="user" @submit="onProfileSaved" />
		</div>
	</div>
</template>
