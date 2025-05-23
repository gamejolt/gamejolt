<script lang="ts">
import { nextTick } from 'vue';
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { formatTime } from '../../filters/time';
import { GameSongModel } from '../../game/song/song.model';
import { AppAudioPlayer } from '../player/player';
import AppAudioScrubber from '../scrubber/AppAudioScrubber.vue';

@Options({
	components: {
		AppAudioPlayer,
		AppAudioScrubber,
	},
})
export default class AppAudioPlaylist extends Vue {
	@Prop(Array)
	songs!: GameSongModel[];

	currentSong: GameSongModel | null = null;
	duration = 0;
	currentTime = 0;
	pausedSong: GameSongModel | null = null;
	pausedSongTime = 0;

	readonly formatTime = formatTime;

	declare $refs: {
		player: AppAudioPlayer;
	};

	/**
	 * When we pause the song, we actually unload the song from the DOM. We
	 * instead store it into the paused song so that we can replay it from where
	 * it left off. Because of this, we want to use the paused song title if it
	 * exists.
	 */
	get songTitle() {
		const song = this.currentSong || this.pausedSong;
		return song ? song.title : this.songs[0].title;
	}

	@Emit('play')
	private async playSong(song: GameSongModel) {
		this.currentSong = song;

		// If this song was previously paused, and now they're starting it
		// again, seek to the time they were at.
		await nextTick();
		if (this.currentSong === this.pausedSong) {
			this.$refs.player.seek(this.pausedSongTime);
		}

		this.pausedSong = null;
		this.pausedSongTime = 0;
	}

	@Emit('stop')
	private async pauseSong() {
		this.pausedSongTime = this.currentTime;
		this.pausedSong = this.currentSong;
		this.currentSong = null;
		await nextTick();
	}

	private async resetSong() {
		this.currentSong = null;
		await nextTick();
		await this.playSong(this.songs[0]);
	}

	private async nextSong() {
		if (!this.currentSong) {
			return;
		}

		// If last song, wrap.
		if (this.currentSong.id === this.songs[this.songs.length - 1].id) {
			await this.resetSong();
		} else {
			const currentIndex = this.songs.findIndex(item => item.id === this.currentSong!.id);
			if (currentIndex !== -1) {
				await this.playSong(this.songs[currentIndex + 1]);
			}
		}
	}

	durationEvent(event: { duration: number; currentTime: number }) {
		this.duration = event.duration;
		this.currentTime = event.currentTime;
	}

	mainSongButton() {
		if (!this.currentSong) {
			if (this.pausedSong) {
				this.playSong(this.pausedSong);
			} else {
				this.playSong(this.songs[0]);
			}
		} else {
			this.pauseSong();
		}
	}

	toggleSong(song: GameSongModel) {
		if (this.currentSong && this.currentSong.id === song.id) {
			this.pauseSong();
		} else {
			this.playSong(song);
		}
	}

	async seek(pos: number) {
		const seekTime = this.duration * pos;
		let player = this.$refs.player;

		if (!player) {
			this.mainSongButton();
			await nextTick();
			player = this.$refs.player;
		}

		player.seek(seekTime);
	}

	onSongEnded() {
		this.nextSong();
	}
}
</script>

<template>
	<div>
		<div class="-player clearfix">
			<AppAudioPlayer
				v-if="currentSong"
				ref="player"
				:song="currentSong"
				@duration="durationEvent"
				@end="onSongEnded"
			/>

			<AppButton
				class="-player-play"
				sparse
				:icon="currentSong ? 'pause' : 'play'"
				@click="mainSongButton"
			/>

			<div class="-player-title">
				{{ songTitle }}
			</div>

			<div class="-scrubber">
				<AppAudioScrubber
					class="-scrubber-component"
					:duration="duration"
					:current-time="currentTime"
					@seek="seek"
				/>

				<!--
					We add a placeholder just so that it takes up the same height.
				-->
				<div class="-scrubber-playtime">
					<span v-if="currentTime && duration" class="text-muted">
						{{ formatTime(currentTime || 0) }}
						/
						{{ formatTime(duration || 0) }}
					</span>
					<span v-else>&nbsp;</span>
				</div>
			</div>
		</div>

		<ul class="-playlist list-unstyled">
			<li
				v-for="(song, i) of songs"
				:key="song.id"
				class="-playlist-item"
				:class="{ active: currentSong && song.id === currentSong.id }"
			>
				<span class="-playlist-play">
					<AppButton
						sparse
						trans
						sm
						:icon="currentSong && song.id === currentSong.id ? 'pause' : 'play-small'"
						@click="toggleSong(song)"
					/>
				</span>
				<span class="-playlist-number text-muted">{{ i + 1 }}.</span>
				<a
					class="-playlist-title link-unstyled"
					:title="song.title"
					@click="toggleSong(song)"
				>
					{{ song.title }}
				</a>
			</li>
		</ul>
	</div>
</template>

<style lang="stylus" src="./playlist.styl" scoped></style>
