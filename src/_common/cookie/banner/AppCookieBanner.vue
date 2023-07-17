<script lang="ts" setup>
import { computed, ref } from 'vue';
import AppButton from '../../button/AppButton.vue';
import { isGoogleBot } from '../../device/device.service';
import { Environment } from '../../environment/environment.service';
import {
	setTimezoneOffsetCookie,
	setUserAgreedToCookies,
	userAgreedToCookies,
} from '../cookie.service';

const forceClosed = ref(false);

const shouldShow = computed(() => {
	if (import.meta.env.SSR || GJ_IS_DESKTOP_APP || isGoogleBot()) {
		return false;
	}

	return !forceClosed.value && !userAgreedToCookies();
});

function close() {
	forceClosed.value = true;
	setUserAgreedToCookies();

	// Might as well set the timezone offset cookie once we have permission.
	setTimezoneOffsetCookie();
}
</script>

<template>
	<div v-if="shouldShow" class="cookie-banner fill-darker">
		<p>
			{{
				$gettext(
					`We use cookies to ensure you get the best personalized experience on our website as well as keeping you signed into your account.`
				)
			}}
			{{ ' ' }}
			<a class="link-help" :href="Environment.baseUrl + '/cookies'" @click="close()">
				{{ $gettext(`Learn more`) }}
			</a>
		</p>
		<div class="text-right">
			<AppButton @click="close()">
				{{ $gettext(`Okay!`) }}
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
