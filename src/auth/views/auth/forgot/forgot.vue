<script lang="ts">
import { Options } from 'vue-property-decorator';
import { BaseRouteComponent } from '../../../../_common/route/route-component';
import FormRetrieveLogin from '../../../components/forms/retrieve-login/retrieve-login.vue';

@Options({
	name: 'RouteAuthForgot',
	components: {
		FormRetrieveLogin,
	},
})
export default class RouteAuthForgot extends BaseRouteComponent {
	get routeTitle() {
		return this.$gettext('Retrieve Login Credentials');
	}

	onSubmitted() {
		this.$router.push({ name: 'auth.forgot-sent' });
	}
}
</script>

<template>
	<div>
		<h2 class="section-header anim-fade-in-enlarge">
			<translate>Trouble logging in?</translate>
		</h2>

		<form-retrieve-login @submit="onSubmitted" />
	</div>
</template>
