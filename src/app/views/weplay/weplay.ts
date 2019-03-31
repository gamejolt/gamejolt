import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import AppCard from 'game-jolt-frontend-lib/components/card/card.vue';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import AppLoading from 'game-jolt-frontend-lib/vue/components/loading/loading.vue';
import { Component } from 'vue-property-decorator';
import AppWeplayLogo from '../../components/weplay/logo/logo.vue';

const LOCALSTORAGE_TIMEOUT_KEY = 'weplay-timeout';
export const LOCALSTORAGE_VISITED_KEY = 'weplay-check';

@Component({
	name: 'RouteWeplay',
	components: {
		AppLoading,
		AppCard,
		AppWeplayLogo,
	},
	directives: {
		AppTooltip,
	},
})
@RouteResolver({
	deps: {},
	resolver: () => User.touch(),
})
export default class RouteWeplay extends BaseRouteComponent {
	private timeoutFor = 0;
	private timer!: NodeJS.Timer;
	private twitchChannel: string | null = null;
	private processing = false;
	private team = -1;
	private turnedOff = false;

	readonly Screen = Screen;

	get twitchChannelUrl() {
		return `https://player.twitch.tv/?channel=${this.twitchChannel}`;
	}

	get routeTitle() {
		return 'Stajoltia';
	}

	get isDisabled() {
		return this.turnedOff || this.team === -1 || this.processing || this.timeoutFor > 0;
	}

	get timeoutFormatted() {
		return (this.timeoutFor / 1000).toFixed(2);
	}

	get teamName() {
		if (this.team !== -1) {
			if (this.team === 0) {
				return 'Alpha';
			} else {
				return 'Beta';
			}
		}
	}

	get teamColor() {
		if (this.team !== -1) {
			if (this.team === 0) {
				return '#ccff00';
			} else {
				return '#ff3fac';
			}
		}
	}

	async mounted() {
		this.checkTimeout = this.checkTimeout.bind(this);
		this.checkTimeout();
		this.timer = setInterval(this.checkTimeout, 100);

		const response = await Api.sendRequest('/web/weplay', null, { processPayload: false });
		const $payload = response.data;
		if (!$payload.success) {
			this.turnedOff = true;
		}
		this.twitchChannel = $payload.channel;
		if ($payload.team === 0 || $payload.team === 1) {
			this.team = $payload.team;
		}

		localStorage.setItem(LOCALSTORAGE_VISITED_KEY, '1');
	}

	beforeDestroy() {
		clearInterval(this.timer);
	}

	private checkTimeout() {
		const value = localStorage.getItem(LOCALSTORAGE_TIMEOUT_KEY);
		if (value !== null) {
			const num = parseInt(value);
			if (num !== NaN) {
				const timeout = num - Date.now();
				this.timeoutFor = timeout;
				return;
			}
		}
		this.timeoutFor = 0;
	}

	public async onClickKey(event: Event, key: string) {
		if (this.timeoutFor > 0) {
			return;
		}

		this.processing = true;
		try {
			const response = await Api.sendRequest(
				'/web/weplay/process-input',
				{ key },
				{ detach: true, processPayload: false }
			);
			const $payload = response.data;
			if ($payload.success) {
				const timeoutValue = ($payload.wait * 1000 + Date.now()).toString();
				localStorage.setItem(LOCALSTORAGE_TIMEOUT_KEY, timeoutValue);
			}
		} catch (error) {
			console.log('Failed to press key');
		}
		this.checkTimeout();
		if (event.target instanceof HTMLButtonElement) {
			event.target.blur();
		}
		this.processing = false;
	}
}
