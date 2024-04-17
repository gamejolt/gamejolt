<script lang="ts">
import { Options } from 'vue-property-decorator';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../_common/route/legacy-route-component';

@Options({
	name: 'RouteAuthForgotSent',
})
@OptionsForLegacyRoute({
	reloadOn: 'never',
})
export default class RouteAuthForgotSent extends LegacyRouteComponent {
	get routeTitle() {
		return this.$gettext('Credentials Sent');
	}
}
</script>

<template>
	<div class="anim-fade-in-up">
		<h2 class="section-header">
			<AppTranslate>Credentials Sent</AppTranslate>
		</h2>

		<p>
			<AppTranslate>
				We've sent information on how to log in to the email address on your account.
			</AppTranslate>
		</p>

		<p class="small text-muted">
			<AppTranslate>
				If you don't see our email within 10 minutes, please check your spam folder. It
				might have been gobbled up!
			</AppTranslate>
		</p>
	</div>
</template>
