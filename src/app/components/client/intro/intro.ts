import { Connection } from 'game-jolt-frontend-lib/components/connection/connection-service';
import { EventBus, EventBusDeregister } from 'game-jolt-frontend-lib/components/event-bus/event-bus.service';
import AppExpand from 'game-jolt-frontend-lib/components/expand/expand.vue';
import { sleep } from 'game-jolt-frontend-lib/utils/utils';
import AppLoading from 'game-jolt-frontend-lib/vue/components/loading/loading.vue';
import { AppState, AppStore } from 'game-jolt-frontend-lib/vue/services/app/app-store';
import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import { Client } from '../../../../_common/client/client.service';
import './intro-global.styl';

@Component({
	components: {
		AppExpand,
		AppLoading,
	},
})
export default class AppClientIntro extends Vue {
	@AppState
	user!: AppStore['user'];

	shouldShowLogo = false;
	shouldShowLoading = false;
	shouldTransitionOut = false;
	private initialStateChangeResolver: Function = null as any;
	private routeChangeAfterDeregister?: EventBusDeregister;

	$refs!: {
		wrap: HTMLDivElement;
	};

	readonly Connection = Connection;

	async created() {
		document.body.classList.add('client-intro-no-overflow');

		// Whatever happens first.
		// The page loaded or the connection is gone.
		const initialStateChangePromise = new Promise(
			resolve => (this.initialStateChangeResolver = resolve)
		);

		// If we started offline, skip immediately.
		if (Connection.isOffline) {
			this.initialStateChangeResolver();
		}

		this.routeChangeAfterDeregister = EventBus.on('routeChangeAfter', () => {
			this.initialStateChangeResolver();
		});

		// We only show the intro if they're logged in. Otherwise we just keep everything hidden and
		// wait for the Client_User service to redirect. When we first log in, we don't have a user
		// many times since the first payload hasn't gotten to us. We set the
		// `client-intro-login-play` value through log in and catch it here to make sure we play
		// anyway.
		if (!this.user && !sessionStorage.getItem('client-intro-login-play')) {
			console.log('Skip intro -- not logged in.');
			this.finish();
			return;
		}

		// Only play once per session. This fixes issues when the client auto-updates and it has to
		// refresh the app.
		if (sessionStorage.getItem('client-intro-has-played')) {
			console.log('Skip intro -- already played this session.');
			this.finish();
			return;
		}

		// If we started silently (through autostart with computer start), then we don't want to
		// play the intro since it'll be in the background. However, if they started it up silently
		// and are now logging in, let's play the intro since they had to manually bring the client
		// forward to do that.
		if (Client.startedSilently && !sessionStorage.getItem('client-intro-login-play')) {
			console.log('Skip intro -- client started silently.');
			this.finish();
			return;
		}

		// Be sure to set that we've played.
		sessionStorage.setItem('client-intro-has-played', 'played');

		await this.startAudio();

		// The sound effect/anim takes about 1.6s
		this.shouldShowLogo = true;
		await sleep(1600);

		// We want to show a "loading" message after a bit of waiting. If it hasn't loaded the
		// homepage by the time the intro has finished, they probably have a slow connection.
		let timer = setTimeout(() => (this.shouldShowLoading = true), 1000);

		// We do the leave animation as soon as the initial state has come into view behind this
		// intro anim.
		await initialStateChangePromise;
		clearTimeout(timer);

		this.shouldShowLoading = false;
		this.shouldTransitionOut = true;
	}

	@Watch('Connection.isOffline')
	onConnectionOnlineChanged(isOffline: boolean) {
		if (isOffline) {
			this.initialStateChangeResolver();
		}
	}

	leaveAnimFinished() {
		this.finish();
	}

	private startAudio() {
		return new Promise(resolve => {
			const audio = new Audio(require('./intro.ogg'));
			audio.volume = 0.15;

			const playHandler = () => {
				audio.removeEventListener('play', playHandler);
				resolve();
			};
			audio.addEventListener('play', playHandler);
			audio.play();
		});
	}

	private finish() {
		document.body.classList.remove('client-intro-no-overflow');
		this.$emit('finish');

		if (this.routeChangeAfterDeregister) {
			this.routeChangeAfterDeregister();
			this.routeChangeAfterDeregister = undefined;
		}
	}
}
