import { Component } from 'vue-property-decorator';
import * as View from '!view!./radio.html?style=./radio.styl';

import { Meta } from '../../../lib/gj-lib-client/components/meta/meta-service';
import { Api } from '../../../lib/gj-lib-client/components/api/api.service';
import { Game } from '../../../lib/gj-lib-client/components/game/game.model';
import { Analytics } from '../../../lib/gj-lib-client/components/analytics/analytics.service';
import { GameSong } from '../../../lib/gj-lib-client/components/game/song/song.model';
import { AppAudioPlayer } from '../../../lib/gj-lib-client/components/audio/player/player';
import { AppAudioScrubber } from '../../../lib/gj-lib-client/components/audio/scrubber/scrubber';
import { AppTrackEvent } from '../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { time } from '../../../lib/gj-lib-client/vue/filters/time';
import { AppJolticon } from '../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { BaseRouteComponent } from '../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteRadio',
	components: {
		AppAudioPlayer,
		AppAudioScrubber,
		AppJolticon,
	},
	directives: {
		AppTrackEvent,
	},
	filters: {
		time,
	},
})
export default class RouteRadio extends BaseRouteComponent {
	song: GameSong = null as any;
	game: Game = null as any;

	currentTime = 0;
	duration = 0;

	get routeTitle() {
		return this.song ? this.song.title : this.$gettext('Radio');
	}

	routeInit() {
		Meta.description = 'Discover new game songs through the Game Jolt radio!';

		// Starting the next song will actually change the title.
		if (!GJ_IS_SSR) {
			this.getNextSong();
		}
	}

	async getNextSong() {
		const payload = await Api.sendRequest('/web/radio/get-random-song');

		this.game = new Game(payload.game);
		this.song = new GameSong(payload.song);

		Analytics.trackEvent('radio', 'load-song');
	}

	durationEvent(event: { duration: number; currentTime: number }) {
		this.duration = event.duration;
		this.currentTime = event.currentTime;
	}

	async seek(pos: number) {
		const seek = this.duration * pos;
		let player = this.$refs.player as AppAudioPlayer;
		player.seek(seek);
	}
}
