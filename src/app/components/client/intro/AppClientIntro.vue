<script lang="ts" setup>
import { ref, watch } from 'vue';
import { Client } from '../../../../_common/client/client.service';
import { Connection } from '../../../../_common/connection/connection-service';
import AppExpand from '../../../../_common/expand/AppExpand.vue';
import AppLoading from '../../../../_common/loading/AppLoading.vue';
import Onboarding from '../../../../_common/onboarding/onboarding.service';
import { onRouteChangeAfter } from '../../../../_common/route/route-component';
import { useCommonStore } from '../../../../_common/store/common-store';
import { EventSubscription } from '../../../../_common/system/event/event-topic';
import { run, sleep } from '../../../../utils/utils';
import introGif from './intro.gif';
import introOgg from './intro.ogg';

const emit = defineEmits({
	finish: () => true,
});

const { user } = useCommonStore();

const shouldShowLogo = ref(false);
const shouldShowLoading = ref(false);
const shouldTransitionOut = ref(false);

// TODO(component-setup-refactor): should initialStateChangeResolver be a ref? and if so, how to initialize?
// Originally: private initialStateChangeResolver: Function = null as any;
const initialStateChangeResolver = ref<(value: any) => void>(() => {});

// TODO(component-setup-refactor): Following
// how EventSubscription is used in AppLightboxPortal.
// Or should we use ref instead?
let routeChangeAfter$: EventSubscription | null = null;

run(async () => {
	document.body.classList.add('client-intro-no-overflow');

	// Whatever happens first.
	// The page loaded or the connection is gone.
	const initialStateChangePromise = new Promise(
		resolve => (initialStateChangeResolver.value = resolve)
	);

	// If we started offline, skip immediately.
	if (Connection.isOffline) {
		initialStateChangeResolver.value();
	}

	routeChangeAfter$ = onRouteChangeAfter.subscribe(() => {
		initialStateChangeResolver.value();
	});

	// We only show the intro if they're logged in. Otherwise we just keep everything hidden and
	// wait for the Client_User service to redirect. When we first log in, we don't have a user
	// many times since the first payload hasn't gotten to us. We set the
	// `client-intro-login-play` value through log in and catch it here to make sure we play
	// anyway.
	if (!user.value && !sessionStorage.getItem('client-intro-login-play')) {
		console.log('Skip intro -- not logged in.');
		finish();
		return;
	}

	if (Onboarding.isOnboarding) {
		console.log('Skip intro -- onboarding started.');
		finish();
		return;
	}

	// Only play once per session. This fixes issues when the client auto-updates and it has to
	// refresh the app.
	if (sessionStorage.getItem('client-intro-has-played')) {
		console.log('Skip intro -- already played this session.');
		finish();
		return;
	}

	// If we started silently (through autostart with computer start), then we don't want to
	// play the intro since it'll be in the background. However, if they started it up silently
	// and are now logging in, let's play the intro since they had to manually bring the client
	// forward to do that.
	if (Client.startedSilently && !sessionStorage.getItem('client-intro-login-play')) {
		console.log('Skip intro -- client started silently.');
		finish();
		return;
	}

	// Be sure to set that we've played.
	sessionStorage.setItem('client-intro-has-played', 'played');

	await startAudio();

	// The sound effect/anim takes about 1.6s
	shouldShowLogo.value = true;
	await sleep(1600);

	// We want to show a "loading" message after a bit of waiting. If it hasn't loaded the
	// homepage by the time the intro has finished, they probably have a slow connection.
	const timer = setTimeout(() => (shouldShowLoading.value = true), 1000);

	// We do the leave animation as soon as the initial state has come into view behind this
	// intro anim.
	await initialStateChangePromise;
	clearTimeout(timer);

	shouldShowLoading.value = false;
	shouldTransitionOut.value = true;
});

watch(
	() => Connection.isOffline,
	() => {
		if (Connection.isOffline) {
			initialStateChangeResolver.value();
		}
	}
);

function leaveAnimFinished() {
	finish();
}

function startAudio() {
	return new Promise<void>(resolve => {
		const audio = new Audio(introOgg);
		audio.volume = 0.15;

		const playHandler = () => {
			audio.removeEventListener('play', playHandler);
			resolve();
		};
		audio.addEventListener('play', playHandler);
		audio.play();
	});
}

function finish() {
	document.body.classList.remove('client-intro-no-overflow');
	emit('finish');
	routeChangeAfter$?.close();
}
</script>

<template>
	<div
		class="client-intro"
		:class="{
			'-leave': shouldTransitionOut,
		}"
		@transitionend="leaveAnimFinished"
	>
		<div class="-wrap">
			<img
				v-if="shouldShowLogo"
				class="-logo"
				:src="introGif"
				width="328"
				height="36"
				alt="Game Jolt"
			/>
		</div>
		<AppExpand :when="shouldShowLoading">
			<br />
			<AppLoading centered />
		</AppExpand>
	</div>
</template>

<style lang="stylus" scoped>
::v-global(.client-intro-no-overflow)
	overflow: hidden

.client-intro
	change-bg('darkest')
	position: fixed
	top: 0
	right: 0
	bottom: 0
	left: 0
	z-index: 100000
	display: flex
	align-items: center
	justify-content: center
	flex-direction: column

	&.-leave
		background-color: var(--theme-darkest-trans)
		transition: all 500ms
		pointer-events: none

		.-wrap
			transition: all 500ms $strong-ease-out
			opacity: 0
			transform: scale(2)

		.loading
			opacity: 0

.-logo
	display: inline-block
	margin: 0 4px
</style>
