import { Options, Prop, Vue, Watch } from 'vue-property-decorator';
import AppAudioPlaylistTS from '../../../audio/playlist/playlist';
import AppAudioPlaylist from '../../../audio/playlist/playlist.vue';
import AppCard from '../../../card/card.vue';
import { Environment } from '../../../environment/environment.service';
import AppFadeCollapse from '../../../fade-collapse/fade-collapse.vue';
import { formatNumber } from '../../../filters/number';
import { Navigate } from '../../../navigate/navigate.service';
import { Screen } from '../../../screen/screen-service';
import { Game } from '../../game.model';
import { GameSong } from '../../song/song.model';

@Options({
	components: {
		AppCard,
		AppFadeCollapse,
		AppAudioPlaylist,
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

	readonly formatNumber = formatNumber;
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
			name: 'download',
			params: {
				type: 'soundtrack',
			},
			query: { game: this.game.id + '' },
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
