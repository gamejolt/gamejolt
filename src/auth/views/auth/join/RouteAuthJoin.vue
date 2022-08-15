<script lang="ts">
import { computed } from 'vue';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { $gettext } from '../../../../_common/translate/translate.service';
import { loggedUserBlock } from '../RouteAuth.vue';
import AppAuthJoin from '../../../../_common/auth/join/join.vue';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { RouterLink } from 'vue-router';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/img/img.vue';
import { useAuthStore } from '../../../store/index';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';

export default {
	...defineAppRouteOptions({
		resolver: async () => loggedUserBlock(),
	}),
};
</script>

<script lang="ts" setup>
const { inviteUser } = useAuthStore();

createAppRoute({
	routeTitle: computed(() => $gettext('Join Game Jolt')),
});
</script>

<template>
	<div>
		<template v-if="inviteUser">
			<div class="-invite">
				<div class="-invite-avatar">
					<AppUserAvatarImg :user="inviteUser" />
				</div>

				<AppSpacer horizontal :scale="2" />

				<div class="-invite-text">
					<AppTranslate :translate-params="{ user: '@' + inviteUser.username }">
						%{ user } is inviting you to Game Jolt!
					</AppTranslate>
				</div>
			</div>

			<AppSpacer vertical :scale="8" />
		</template>

		<AppAuthJoin overlay />

		<div class="auth-page-links text-right anim-fade-in">
			<div class="auth-page-link">
				<AppTranslate>Already have an account?</AppTranslate>
				{{ ' ' }}
				<RouterLink :to="{ name: 'auth.login' }">
					<AppTranslate>Log in!</AppTranslate>
				</RouterLink>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-invite
	display: flex
	flex-direction: row
	align-items: center

.-invite-avatar
	width: 48px

.-invite-text
	font-size: 17px
	font-weight: 700
</style>
