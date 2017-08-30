import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import * as View from '!view!./intro.html?style=./intro.styl';
import { EventBus } from '../../../../lib/gj-lib-client/components/event-bus/event-bus.service';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { Connection } from '../../../../lib/gj-lib-client/components/connection/connection-service';
import { AppState, AppStore } from '../../../../lib/gj-lib-client/vue/services/app/app-store';
import { ClientControl } from '../control/client.service';
import { sleep } from '../../../../lib/gj-lib-client/utils/utils';
import { AppExpand } from '../../../../lib/gj-lib-client/components/expand/expand';
import { AppLoading } from '../../../../lib/gj-lib-client/vue/components/loading/loading';

// TODO(rewrite,cros) - Intro doesn't work. The styles don't show the loading and the loading may not be done at the right moment.

@View
@Component({
	components: {
		AppExpand,
		AppLoading,
	},
})
export class AppClientIntro extends Vue {
	@AppState user: AppStore['user'];

	done = false;
	shouldShowLoading = false;
	initialStateChangeResolver: Function = null as any;

	$refs: {
		wrap: HTMLDivElement;
	};

	readonly Connection = makeObservableService(Connection);

	async created() {
		document.body.classList.add('client-intro-no-overflow');

		const initialStateChangePromise = new Promise(
			resolve => (this.initialStateChangeResolver = resolve)
		);

		// Whatever happens first.
		// The page loaded or the connection is gone.
		EventBus.on('routeChangeAfter', () => {
			console.log('page loaded');
			this.initialStateChangeResolver();
		});

		// We only show the intro if they're logged in.
		// Otherwise we just keep everything hidden and wait for the Client_User service to redirect.
		// When we first log in, we don't have a user many times since the first payload hasn't gotten to us.
		// We set the `client-intro-login-play` value through log in and catch it here to make sure we play anyway.
		if (!this.user && !sessionStorage.getItem('client-intro-login-play')) {
			console.log('Not logged in');
			return;
		}

		// Only play once per session.
		// This fixes issues when the client auto-updates and it has to refresh the app.
		if (sessionStorage.getItem('client-intro-has-played')) {
			console.log('Already played this session');
			this.finish();
			return;
		}

		// If we started silently (through autostart with computer start), then we don't want to play the intro
		// since it'll be in the background. However, if they started it up silently and are now logging in,
		// let's play the intro since they had to manually bring the client forward to do that.
		if (ClientControl.startedSilently && !sessionStorage.getItem('client-intro-login-play')) {
			console.log('Started silently');
			this.finish();
			return;
		}

		// Be sure to set that we've played.
		sessionStorage.setItem('client-intro-has-played', 'played');

		console.log('Playing sound');
		await this.playSound();

		// The sound effect/anim takes about 1.6s
		console.log('Showing logo');
		this.showLogo();
		await sleep(1600);

		// We want to show a "loading" message after a bit of waiting.
		// If it hasn't loaded the homepage by the time the intro has finished, they probably have a slow connection.
		let loadingDone = false;
		sleep(1000).then(() => {
			if (!loadingDone) {
				this.shouldShowLoading = true;
			}
		});

		// We do the leave animation as soon as the initial state has come into
		// view behind this intro anim.
		console.log('Waiting for loading to be done');
		await initialStateChangePromise;
		console.log('eyyy');
		loadingDone = true;
		this.shouldShowLoading = false;

		await this.setAnim(this.$el, 'client-intro-leave', true);
		this.finish();
	}

	@Watch('Connection.isOnline', { immediate: true })
	onConnectionOnlineChanged(isOnline: boolean) {
		if (!isOnline) {
			this.initialStateChangeResolver();
		}
	}

	private setAnim(element: HTMLElement, className: string, transition?: boolean) {
		const type = transition ? 'transitionend' : 'animationend';

		return new Promise<HTMLElement>(resolve => {
			const endHandler = () => {
				element.removeEventListener(type, endHandler);
				resolve(element);
			};
			element.addEventListener(type, endHandler);
			element.classList.add(className);
		});
	}

	private showLogo() {
		const img = new Image(328, 36);
		img.src = require('./intro.gif');
		img.className = 'client-intro-logo';

		this.$refs.wrap.appendChild(img);
	}

	private playSound() {
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
		this.done = true;
		this.$emit('done');
	}
}
