<script lang="ts">
import { Options } from 'vue-property-decorator';
import { BaseRouteComponent, OptionsForRoute } from '../../../_common/route/route-component';

@Options({
	name: 'RouteSentKey',
})
@OptionsForRoute()
export default class RouteSentKey extends BaseRouteComponent {
	get routeTitle() {
		return this.$gettext('Keys Sent');
	}
}
</script>

<template>
	<section class="container">
		<p class="lead text-center">
			<AppTranslate>Awesome. We're sending you an email with your keys.</AppTranslate>
		</p>
		<p class="lead text-center">
			<AppTranslate>
				Note that it might take a few minutes. If you don't see it soon, check your spam
				folder or something, okay?
			</AppTranslate>
		</p>
	</section>
</template>
