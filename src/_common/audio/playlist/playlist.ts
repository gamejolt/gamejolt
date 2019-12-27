import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { time } from '../../filters/time';
import { GameSong } from '../../game/song/song.model';
import { AppAudioPlayer } from '../player/player';
import AppAudioScrubber from '../scrubber/scrubber.vue';

@Component({
	components: {
		AppAudioPlayer,
		AppAudioScrubber,
	},
	filters: {
		time,
	},
})
export default class AppAudioPlaylist extends Vue {
	@Prop(Array)
	songs!: GameSong[];

	currentSong: GameSong | null = null;
	duration = 0;
	currentTime = 0;
	pausedSong: GameSong | null = null;
	pausedSongTime = 0;

	$refs!: {
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
	private async playSong(song: GameSong) {
		this.currentSong = song;

		// If this song was previously paused, and now they're starting it
		// again, seek to the time they were at.
		await this.$nextTick();
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
		await this.$nextTick();
	}

	private async resetSong() {
		this.currentSong = null;
		await this.$nextTick();
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

	toggleSong(song: GameSong) {
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
			await this.$nextTick();
			player = this.$refs.player;
		}

		player.seek(seekTime);
	}

	onSongEnded() {
		this.nextSong();
	}
}
