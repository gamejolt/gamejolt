<template>
	<div>
		<div class="-player clearfix">
			<app-audio-player
				v-if="currentSong"
				ref="player"
				:song="currentSong"
				@duration="durationEvent"
				@end="onSongEnded"
			/>

			<app-button
				class="-player-play"
				sparse
				:icon="currentSong ? 'pause' : 'play'"
				@click="mainSongButton"
				v-app-track-event="`audio-playlist:click:button`"
			/>

			<div class="-player-title">
				{{ songTitle }}
			</div>

			<div class="-scrubber">
				<app-audio-scrubber
					class="-scrubber-component"
					:duration="duration"
					:current-time="currentTime"
					@seek="seek"
				/>

				<!--
				We add a placeholder just so that it takes up the same height.
			-->
				<div class="-scrubber-playtime">
					<span v-if="currentTime && duration" key="duration" class="text-muted">
						{{ (currentTime || 0) | time }}
						/
						{{ (duration || 0) | time }}
					</span>
					<span v-else key="placeholder">
						&nbsp;
					</span>
				</div>
			</div>
		</div>

		<ul class="-playlist list-unstyled">
			<li
				class="-playlist-item"
				v-for="(song, i) of songs"
				:key="song.id"
				:class="{ active: currentSong && song.id === currentSong.id }"
			>
				<span class="-playlist-play">
					<app-button
						sparse
						trans
						sm
						:icon="currentSong && song.id === currentSong.id ? 'pause' : 'play-small'"
						@click="toggleSong(song)"
						v-app-track-event="`audio-playlist:click:icon`"
					/>
				</span>
				<span class="-playlist-number text-muted">{{ i + 1 }}.</span>
				<a
					class="-playlist-title link-unstyled"
					:title="song.title"
					@click="toggleSong(song)"
					v-app-track-event="`audio-playlist:click:title`"
				>
					{{ song.title }}
				</a>
			</li>
		</ul>
	</div>
</template>

<style lang="stylus" src="./playlist.styl" scoped></style>

<script lang="ts" src="./playlist"></script>
