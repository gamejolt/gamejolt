<script lang="ts" setup>
import { computed, nextTick, ref, useTemplateRef } from 'vue';
import AppButton from '../../button/AppButton.vue';
import { formatTime } from '../../filters/time';
import { GameSongModel } from '../../game/song/song.model';
import AppAudioPlayer from '../player/AppAudioPlayer.vue';
import AppAudioScrubber from '../scrubber/AppAudioScrubber.vue';

type Props = {
	songs: GameSongModel[];
};

const { songs } = defineProps<Props>();

const emit = defineEmits<{
	play: [song: GameSongModel];
	stop: [];
}>();

const currentSong = ref<GameSongModel | null>(null);
const duration = ref(0);
const currentTime = ref(0);
const pausedSong = ref<GameSongModel | null>(null);
const pausedSongTime = ref(0);

const playerRef = useTemplateRef('player');

/**
 * When we pause the song, we actually unload the song from the DOM. We
 * instead store it into the paused song so that we can replay it from where
 * it left off. Because of this, we want to use the paused song title if it
 * exists.
 */
const songTitle = computed(() => {
	const song = currentSong.value || pausedSong.value;
	return song ? song.title : songs[0].title;
});

async function playSong(song: GameSongModel) {
	currentSong.value = song;
	emit('play', song);

	// If this song was previously paused, and now they're starting it
	// again, seek to the time they were at.
	await nextTick();
	if (currentSong.value === pausedSong.value) {
		playerRef.value?.seek(pausedSongTime.value);
	}

	pausedSong.value = null;
	pausedSongTime.value = 0;
}

async function pauseSong() {
	pausedSongTime.value = currentTime.value;
	pausedSong.value = currentSong.value;
	currentSong.value = null;
	emit('stop');
	await nextTick();
}

async function resetSong() {
	currentSong.value = null;
	await nextTick();
	await playSong(songs[0]);
}

async function nextSong() {
	if (!currentSong.value) {
		return;
	}

	// If last song, wrap.
	if (currentSong.value.id === songs[songs.length - 1].id) {
		await resetSong();
	} else {
		const currentIndex = songs.findIndex(item => item.id === currentSong.value!.id);
		if (currentIndex !== -1) {
			await playSong(songs[currentIndex + 1]);
		}
	}
}

function durationEvent(event: { duration: number; currentTime: number }) {
	duration.value = event.duration;
	currentTime.value = event.currentTime;
}

function mainSongButton() {
	if (!currentSong.value) {
		if (pausedSong.value) {
			playSong(pausedSong.value);
		} else {
			playSong(songs[0]);
		}
	} else {
		pauseSong();
	}
}

function toggleSong(song: GameSongModel) {
	if (currentSong.value && currentSong.value.id === song.id) {
		pauseSong();
	} else {
		playSong(song);
	}
}

async function seek(pos: number) {
	const seekTime = duration.value * pos;
	let playerEl = playerRef.value;

	if (!playerEl) {
		mainSongButton();
		await nextTick();
		playerEl = playerRef.value;
	}

	playerEl?.seek(seekTime);
}

function onSongEnded() {
	nextSong();
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
