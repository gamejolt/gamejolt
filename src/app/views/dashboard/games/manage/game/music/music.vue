<template>
	<div class="row" v-if="isRouteBootstrapped">
		<div class="col-sm-4 col-sm-push-8">
			<div class="page-help">
				<p>
					<translate>
						Let people enjoy your game's soundtrack whenever they want! Upload MP3s of music from
						your game and the songs will appear on your game page in a nice little music player.
						Don't upload copyrighted songs without permission!
					</translate>
				</p>
			</div>
		</div>

		<div class="col-sm-8 col-sm-pull-4">
			<div class="alert" v-if="!songs.length">
				<p>
					<translate>
						You haven't added any music. Upload some songs from your game! The music player's worth
						it, trust us!
					</translate>
				</p>
			</div>

			<app-loading-fade :is-loading="isProcessing">
				<app-card-list
					:items="songs"
					:active-item="activeItem"
					:is-adding="isAdding"
					@activate="activeItem = $event"
				>
					<app-card-list-draggable @change="saveSongSort">
						<app-card-list-item v-for="song of songs" :key="song.id" :item="song">
							<a class="card-remove" @click.stop="removeSong(song)">
								<app-jolticon icon="remove" />
							</a>

							<div class="card-title">
								<h5>{{ song.title }}</h5>
							</div>

							<template slot="body">
								<form-game-song :game="game" :model="song" @submit="onSongEdited" />
							</template>
						</app-card-list-item>
					</app-card-list-draggable>

					<app-card-list-add
						:label="$gettext('dash.games.music.add_button')"
						@toggle="isAdding = !isAdding"
					>
						<form-game-song :game="game" @submit="onSongAdded" />
					</app-card-list-add>
				</app-card-list>
			</app-loading-fade>

			<app-dash-game-wizard-controls />
		</div>
	</div>
</template>

<script lang="ts" src="./music" />
