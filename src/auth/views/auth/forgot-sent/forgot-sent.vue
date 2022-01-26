<script lang="ts">
import { Options } from 'vue-property-decorator';
import { BaseRouteComponent } from '../../../../_common/route/route-component';

@Options({
	name: 'RouteAuthForgotSent',
})
export default class RouteAuthForgotSent extends BaseRouteComponent {
	get routeTitle() {
		return this.$gettext('Credentials Sent');
	}
}
</script>

<template>
	<div class="anim-fade-in-up">
		<h2 class="section-header">
			<translate>Credentials Sent</translate>
		</h2>

		<p>
			<translate>
				We've sent information on how to log in to the email address on your account.
			</translate>
		</p>

		<p class="small text-muted">
			<translate>
				If you don't see our email within 10 minutes, please check your spam folder. It
				might have been gobbled up!
			</translate>
		</p>
	</div>
</template>
