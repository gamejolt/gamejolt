<script lang="ts">
import { Options } from 'vue-property-decorator';
import AppAuthJoin from '../../../../_common/auth/join/join.vue';
import { Connection } from '../../../../_common/connection/connection-service';
import { BaseRouteComponent, RouteResolver } from '../../../../_common/route/route-component';
import { loggedUserBlock } from '../auth.vue';

@Options({
	name: 'RouteAuthJoin',
	components: {
		AppAuthJoin,
	},
})
@RouteResolver({
	async resolver() {
		return loggedUserBlock();
	},
})
export default class RouteAuthJoin extends BaseRouteComponent {
	readonly Connection = Connection;

	get routeTitle() {
		return this.$gettext('auth.join.page_title');
	}
}
</script>

<template>
	<div>
		<app-auth-join overlay />

		<div class="auth-page-links text-right anim-fade-in">
			<div class="auth-page-link">
				<translate>Already have an account?</translate>
				{{ ' ' }}
				<router-link :to="{ name: 'auth.login' }">
					<translate>Log in!</translate>
				</router-link>
			</div>
		</div>
	</div>
</template>
