<script lang="ts">
import { Options } from 'vue-property-decorator';
import AppAuthJoin from '../../../../_common/auth/join/join.vue';
import { Connection } from '../../../../_common/connection/connection-service';
import { BaseRouteComponent, OptionsForRoute } from '../../../../_common/route/route-component';
import { loggedUserBlock } from '../RouteAuth.vue';

@Options({
	name: 'RouteAuthJoin',
	components: {
		AppAuthJoin,
	},
})
@OptionsForRoute({
	async resolver() {
		return loggedUserBlock();
	},
})
export default class RouteAuthJoin extends BaseRouteComponent {
	readonly Connection = Connection;

	get routeTitle() {
		return this.$gettext('Join Game Jolt - The Largest Collection of Indie Games by People');
	}
}
</script>

<template>
	<div>
		<AppAuthJoin overlay />

		<div class="auth-page-links text-right anim-fade-in">
			<div class="auth-page-link">
				<AppTranslate>Already have an account?</AppTranslate>
				{{ ' ' }}
				<router-link :to="{ name: 'auth.login' }">
					<AppTranslate>Log in!</AppTranslate>
				</router-link>
			</div>
		</div>
	</div>
</template>
