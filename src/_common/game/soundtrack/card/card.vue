<script lang="ts">
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
	@Prop(Object)
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

		if (GJ_IS_DESKTOP_APP) {
			// Gotta go past the first char since it's # in client.
			Navigate.gotoExternal(
				Environment.baseUrl + this.$router.resolve(location).href.substr(1)
			);
			return;
		}

		this.$router.push(location);
	}
}
</script>

<template>
	<app-card class="soundtrack-package-card">
		<div class="card-title">
			<h4>
				<translate>Game Soundtrack</translate>
				<app-jolticon icon="musical-note-double" big class="pull-right text-muted" />
			</h4>
		</div>

		<div class="card-meta">
			<translate
				:translate-n="songs.length"
				:translate-params="{ count: formatNumber(songs.length) }"
				translate-plural="%{ count } songs"
			>
				%{ count } song
			</translate>
		</div>

		<br />

		<div class="card-content">
			<app-fade-collapse
				:collapse-height="250"
				:is-open="isShowingSoundtrack"
				@require-change="canToggleSoundtrack = $event"
				@expand="isShowingSoundtrack = true"
			>
				<app-audio-playlist
					ref="playlist"
					:songs="songs"
					@play="isPlaying = true"
					@stop="isPlaying = false"
				/>
			</app-fade-collapse>
		</div>

		<a
			class="hidden-text-expander"
			v-if="canToggleSoundtrack"
			@click="isShowingSoundtrack = !isShowingSoundtrack"
			v-app-track-event="`game-soundtrack-card:show-all-songs`"
		/>

		<div class="card-controls">
			<app-button
				primary
				@click="download"
				v-app-track-event="`game-soundtrack-card:download`"
			>
				<translate>Download</translate>
				<app-jolticon icon="musical-note-double" class="jolticon-addon" />
			</app-button>
		</div>
	</app-card>
</template>
