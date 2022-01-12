<script lang="ts" src="./music"></script>

<template>
	<div v-if="isRouteBootstrapped" class="row">
		<div class="col-sm-4 col-sm-push-8">
			<div class="page-help">
				<p>
					<translate>
						Let people enjoy your game's soundtrack whenever they want! Upload MP3s of
						music from your game and the songs will appear on your game page in a nice
						little music player. Don't upload copyrighted songs without permission!
					</translate>
				</p>
			</div>
		</div>

		<div class="col-sm-8 col-sm-pull-4">
			<div v-if="!songs.length" class="alert">
				<p>
					<translate>
						You haven't added any music. Upload some songs from your game! The music
						player's worth it, trust us!
					</translate>
				</p>
			</div>

			<app-loading-fade :is-loading="isProcessing">
				<app-card-list
					:items="songs"
					:active-item="activeItem"
					:is-adding="isAdding"
					is-draggable
					@activate="activeItem = $event"
				>
					<app-card-list-draggable item-key="id" @change="saveSongSort">
						<template #item="{ element: song }">
							<app-card-list-item :item="song">
								<a class="card-remove" @click.stop="removeSong(song)">
									<app-jolticon icon="remove" />
								</a>

								<div class="card-title">
									<h5>{{ song.title }}</h5>
								</div>

								<template #body>
									<form-game-song
										:game="game"
										:model="song"
										@submit="onSongEdited"
									/>
								</template>
							</app-card-list-item>
						</template>
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
