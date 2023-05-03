<script lang="ts">
import { Options, Vue } from 'vue-property-decorator';
import { Environment } from '../../environment/environment.service';
import {
	setTimezoneOffsetCookie,
	setUserAgreedToCookies,
	userAgreedToCookies,
} from '../cookie.service';

@Options({})
export default class AppCookieBanner extends Vue {
	readonly Environment = Environment;

	forceClosed = false;

	get shouldShow() {
		if (import.meta.env.SSR || GJ_IS_DESKTOP_APP) {
			return false;
		}

		return !this.forceClosed && !userAgreedToCookies();
	}

	close() {
		this.forceClosed = true;
		setUserAgreedToCookies();

		// Might as well set the timezone offset cookie once we have permission.
		setTimezoneOffsetCookie();
	}
}
</script>

<template>
	<div v-if="shouldShow" class="cookie-banner fill-darker">
		<p>
			<AppTranslate>
				We use cookies to ensure you get the best personalized experience on our website as
				well as keeping you signed into your account.
			</AppTranslate>
			{{ ' ' }}
			<a class="link-help" :href="Environment.baseUrl + '/cookies'" @click="close()">
				<AppTranslate>Learn more</AppTranslate>
			</a>
		</p>
		<div class="text-right">
			<AppButton @click="close()">
				<AppTranslate>Okay!</AppTranslate>
			</AppButton>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
$-width = 450px

.cookie-banner
	rounded-corners-lg()
	position: fixed
	border:  $border-width-base solid var(--theme-bg-subtle)
	box-shadow: 0 5px 15px rgba($black, 0.5)
	z-index: 10000
	bottom: ($grid-gutter-width-xs / 2)
	right: ($grid-gutter-width-xs / 2)
	left: ($grid-gutter-width-xs / 2)
	padding: ($grid-gutter-width-xs / 2)

	@media $media-sm-up
		bottom: ($grid-gutter-width / 2)
		padding: ($grid-gutter-width / 2)
		left: 50%
		margin-left: -($-width / 2)
		width: $-width
</style>
