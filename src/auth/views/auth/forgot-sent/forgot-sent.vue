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
			<AppTranslate>auth.forgot.sent.heading</AppTranslate>
		</h2>

		<p>
			<AppTranslate>
				We've sent information on how to log in to the email address on your account.
			</AppTranslate>
		</p>

		<p class="small text-muted">
			<AppTranslate>auth.forgot.sent.spam</AppTranslate>
		</p>
	</div>
</template>
