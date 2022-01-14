<script lang="ts">
import { Options } from 'vue-property-decorator';
import { BaseRouteComponent } from '../../../../_common/route/route-component';

@Options({
	name: 'RouteAuthForgotSent',
})
export default class RouteAuthForgotSent extends BaseRouteComponent {
	get routeTitle() {
		return this.$gettext('auth.forgot.sent.page_title');
	}
}
</script>

<template>
	<div class="anim-fade-in-up">
		<h2 class="section-header">
			<translate>auth.forgot.sent.heading</translate>
		</h2>

		<p>
			<translate>
				We've sent information on how to log in to the email address on your account.
			</translate>
		</p>

		<p class="small text-muted">
			<translate>auth.forgot.sent.spam</translate>
		</p>
	</div>
</template>
