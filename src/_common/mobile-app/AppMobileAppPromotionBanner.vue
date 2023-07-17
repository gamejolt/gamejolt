<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { trackAppPromotionClick } from '../analytics/analytics.service';
import AppButton from '../button/AppButton.vue';
import { isGoogleBot } from '../device/device.service';
import { illMobileKikkerstein } from '../illustration/illustrations';
import { Screen } from '../screen/screen-service';
import AppSpacer from '../spacer/AppSpacer.vue';
import { useCommonStore } from '../store/common-store';
import AppTheme from '../theme/AppTheme.vue';
import AppTranslate from '../translate/AppTranslate.vue';
import { getAppUrl, useAppPromotionStore } from './store';

const StorageKey = 'banner:app-promo';

const route = useRoute();
const appPromotion = useAppPromotionStore();
const { user: commonUser } = useCommonStore();

const storeUrl = computed(() => getAppUrl(appPromotion));

const forceClosed = ref(false);

const shouldShow = computed(() => {
	if (import.meta.env.SSR || GJ_IS_DESKTOP_APP || isGoogleBot()) {
		return false;
	}

	if (sessionStorage.getItem(StorageKey) || !Screen.isXs || forceClosed.value || !route.name) {
		return false;
	}

	const routeName = String(route.name);

	// Don't include the discover homepage since it has mobile promotion
	// already. Firesides also show a mobile promo.
	return (
		routeName.startsWith('communities.') ||
		routeName.startsWith('realms.') ||
		routeName.startsWith('profile.') ||
		(commonUser.value && routeName === 'home') ||
		routeName === 'discover.communities' ||
		routeName === 'post'
	);
});

// We show a different message if we are on a route that is related to a user
// somehow.
const isUserRelated = computed(() => {
	const routeName = String(route.name ?? '');
	return routeName === 'post' || routeName.startsWith('profile.');
});

function close() {
	forceClosed.value = true;
	sessionStorage.setItem(StorageKey, Date.now() + '');
}
</script>

<template>
	<AppTheme v-if="shouldShow" class="-banner-outer" force-dark>
		<div class="-ill">
			<img
				:src="illMobileKikkerstein.path"
				:width="illMobileKikkerstein.width / 3"
				:height="illMobileKikkerstein.height / 3"
			/>
		</div>

		<div class="-banner">
			<div class="-banner-back" />
			<div class="-banner-front">
				<p class="-get-text">
					<AppTranslate v-if="isUserRelated">
						Never miss a post in the Game Jolt app!
					</AppTranslate>
					<AppTranslate v-else>Use the Game Jolt app. It's 🔥🔥🔥!</AppTranslate>
				</p>

				<AppSpacer vertical :scale="4" />

				<AppButton
					block
					primary
					solid
					:href="storeUrl"
					target="_blank"
					@click="trackAppPromotionClick({ source: 'banner', platform: 'mobile' })"
				>
					<AppTranslate>Get the app</AppTranslate>
				</AppButton>
				<AppButton block trans @click="close()">
					<AppTranslate>Not right now</AppTranslate>
				</AppButton>
			</div>
		</div>
	</AppTheme>
</template>

<style lang="stylus" scoped>
.-banner-outer
	position: fixed
	bottom: 0
	left: 0
	right: 0
	z-index: $zindex-shell-body + 1

.-banner
	padding: 16px
	backdrop-filter: blur(16px)
	border-top-left-radius: 12px
	border-top-right-radius: 12px
	overflow: hidden

.-banner-back
	position: absolute
	top: 0
	bottom: 0
	left: 0
	right: 0
	background: var(--theme-darkest)
	opacity: 0.8
	border-top-left-radius: 12px
	border-top-right-radius: 12px

.-banner-front
	position: relative
	z-index: 1

.-get-text
	padding-top: 28px
	margin: 0 auto
	font-weight: 700
	font-size: 19px
	max-width: 230px
	text-align: center
	color: var(--theme-fg)

.-ill
	position: absolute
	left: 0
	right: 0
	top: -90px
	display: flex
	justify-content: center
	pointer-events: none
	z-index: 2
</style>
