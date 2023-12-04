<script lang="ts">
import { Options, Prop, Vue, Watch } from 'vue-property-decorator';
import type { RouteLocationRaw } from 'vue-router';
import AppFadeCollapse from '../../../AppFadeCollapse.vue';
import AppAudioPlaylistTS from '../../../audio/playlist/playlist';
import AppAudioPlaylist from '../../../audio/playlist/playlist.vue';
import AppCard from '../../../card/AppCard.vue';
import { Environment } from '../../../environment/environment.service';
import { formatNumber } from '../../../filters/number';
import { Navigate } from '../../../navigate/navigate.service';
import { Screen } from '../../../screen/screen-service';
import { GameModel } from '../../game.model';
import { GameSongModel } from '../../song/song.model';

@Options({
	components: {
		AppCard,
		AppFadeCollapse,
		AppAudioPlaylist,
	},
})
export default class AppGameSoundtrackCard extends Vue {
	@Prop(Object)
	game!: GameModel;

	@Prop(Array)
	songs!: GameSongModel[];

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
		const location: RouteLocationRaw = {
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
	<AppCard class="soundtrack-package-card">
		<div class="card-title">
			<h4>
				<AppTranslate>Game Soundtrack</AppTranslate>
				<AppJolticon icon="musical-note-double" big class="pull-right text-muted" />
			</h4>
		</div>

		<div class="card-meta">
			<AppTranslate
				:translate-n="songs.length"
				:translate-params="{ count: formatNumber(songs.length) }"
				translate-plural="%{ count } songs"
			>
				%{ count } song
			</AppTranslate>
		</div>

		<br />

		<div class="card-content">
			<AppFadeCollapse
				:collapse-height="250"
				:is-open="isShowingSoundtrack"
				@require-change="canToggleSoundtrack = $event"
				@expand="isShowingSoundtrack = true"
			>
				<AppAudioPlaylist
					ref="playlist"
					:songs="songs"
					@play="isPlaying = true"
					@stop="isPlaying = false"
				/>
			</AppFadeCollapse>
		</div>

		<a
			v-if="canToggleSoundtrack"
			v-app-track-event="`game-soundtrack-card:show-all-songs`"
			class="hidden-text-expander"
			@click="isShowingSoundtrack = !isShowingSoundtrack"
		/>

		<div class="card-controls">
			<AppButton
				v-app-track-event="`game-soundtrack-card:download`"
				primary
				@click="download"
			>
				<AppTranslate>Download</AppTranslate>
				<AppJolticon icon="musical-note-double" class="jolticon-addon" />
			</AppButton>
		</div>
	</AppCard>
</template>
