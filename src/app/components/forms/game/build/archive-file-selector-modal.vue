<script lang="ts" src="./archive-file-selector-modal"></script>

<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="close()">
				<translate>
					dash.games.releases.builds.launch_options.file_selector.cancel_button
				</translate>
			</app-button>
		</div>

		<div class="modal-header">
			<h2 class="modal-title">
				<translate>
					dash.games.releases.builds.launch_options.file_selector.heading
				</translate>
			</h2>
		</div>

		<div class="modal-body">
			<app-loading v-if="!isLoaded" :big="true" class="loading-centered" />

			<div v-else-if="files.length">
				<div class="form-group">
					<input
						v-model="filter"
						class="form-control"
						type="search"
						:placeholder="
							$gettext(
								`dash.games.releases.builds.launch_options.file_selector.filter_placeholder`
							)
						"
					/>
				</div>

				<div class="list-group">
					<a
						v-for="(file, i) of filteredFiles"
						:key="i"
						class="list-group-item thin"
						@click="select(file)"
					>
						{{ file }}
					</a>
				</div>
			</div>

			<div v-else class="alert alert-notice">
				<p>
					<translate>
						Oh no! We didn't find any executable files for this platform in the archive.
					</translate>
				</p>
			</div>
		</div>
	</app-modal>
</template>
