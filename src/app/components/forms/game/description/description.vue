<template>
	<app-form name="descriptionForm" ref="form">
		<app-form-group
			name="description_content"
			:label="$gettext(`dash.games.form.description_label`)"
			hide-label
		>
			<app-form-control-content
				:placeholder="$gettext(`Write your game description here...`)"
				content-context="game-description"
				:model-id="model.id"
			/>

			<app-form-control-errors />
		</app-form-group>

		<app-form-game-description-tags
			class="-tags"
			:text="tagText"
			:tags="tags"
			:content="contentDocument"
			@tag="addTag($event)"
		/>

		<app-expand :when="isFnafDetected">
			<div class="alert alert-notice">
				<div v-translate>
					<strong>
						It appears that your game may be a Five Nights at Freddy's fan game, spinoff, or
						unofficial sequel.
					</strong>
					Therefore, we have added the hashtag
					<code>#fnaf</code>
					to your game's description. We require this tag for all games derived from the Five Nights
					at Freddy's series.
				</div>

				<app-game-perms required="details" tag="div" class="alert-actions">
					<app-button primary icon="tag" @click="addAutotag('fnaf')">
						<translate>dash.games.add.fnaf_autotag_accept</translate>
					</app-button>

					<app-button trans @click="skipAutotag()">
						<translate>dash.games.add.fnaf_autotag_reject</translate>
					</app-button>
				</app-game-perms>
			</div>
		</app-expand>

		<app-game-perms required="details">
			<app-dash-game-wizard-controls v-if="!isFnafDetected">
				<app-form-button>
					<translate>Save Description</translate>
				</app-form-button>
			</app-dash-game-wizard-controls>
		</app-game-perms>
	</app-form>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

.-tags
	margin-bottom: $line-height-computed
</style>

<script lang="ts" src="./description"></script>
