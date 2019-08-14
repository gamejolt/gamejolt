import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import AppJolticon from '../../../../vue/components/jolticon/jolticon.vue';
import { number } from '../../../../vue/filters/number';
import { AppTrackEvent } from '../../../analytics/track-event.directive';
import AppAudioPlaylistTS from '../../../audio/playlist/playlist';
import AppAudioPlaylist from '../../../audio/playlist/playlist.vue';
import AppCard from '../../../card/card.vue';
import { Environment } from '../../../environment/environment.service';
import AppFadeCollapse from '../../../fade-collapse/fade-collapse.vue';
import { Navigate } from '../../../navigate/navigate.service';
import { Screen } from '../../../screen/screen-service';
import { Game } from '../../game.model';
import { GameSong } from '../../song/song.model';

@Component({
	components: {
		AppCard,
		AppJolticon,
		AppFadeCollapse,
		AppAudioPlaylist,
	},
	directives: {
		AppTrackEvent,
	},
})
export default class AppGameSoundtrackCard extends Vue {
	@Prop(Game)
	game!: Game;

	@Prop(Array)
	songs!: GameSong[];

	isPlaying = false;
	isShowingSoundtrack = false;
	canToggleSoundtrack = false;

	readonly number = number;
	readonly Screen = Screen;

	@Watch('isPlaying')
	onPlayingChanged() {
		// If we're playing, make sure the full soundtrack is open.
		if (this.isPlaying) {
			this.isShowingSoundtrack = true;
		}
	}

	play() {
		const playlist = this.$refs.playlist as AppAudioPlaylistTS;
		if (playlist) {
			playlist.mainSongButton();
		}
	}

	download() {
		const location = {
			name: 'discover.games.view.download.soundtrack',
			params: { slug: this.game.slug, id: this.game.id + '' },
		};

		if (GJ_IS_CLIENT) {
			// Gotta go past the first char since it's # in client.
			Navigate.gotoExternal(
				Environment.baseUrl + this.$router.resolve(location).href.substr(1)
			);
			return;
		}

		this.$router.push(location);
	}
}
