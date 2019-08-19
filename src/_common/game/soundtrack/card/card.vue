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
				:translate-params="{ count: number(songs.length) }"
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
			<app-button primary @click="download" v-app-track-event="`game-soundtrack-card:download`">
				<translate>Download</translate>
				<app-jolticon icon="musical-note-double" class="jolticon-addon" />
			</app-button>
		</div>
	</app-card>
</template>

<script lang="ts" src="./card"></script>
