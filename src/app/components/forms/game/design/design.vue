<template>
	<app-form name="designForm">
		<div class="row">
			<div class="col-sm-6">
				<h4 class="sans-margin-top">
					<translate>Game Thumbnail</translate>
				</h4>

				<div class="page-help">
					<p>
						<translate>
							A thumbnail is the little rectangular image that represents your game throughout the
							site. People can click it in game listings and search results to get to your game
							page.
						</translate>
					</p>
					<p>
						<translate>
							Please don't choose an image that contains nudity, swear words, or adult-oriented
							imagery.
						</translate>
					</p>
					<p>
						<a class="link-help" href="https://help.gamejolt.com/dev-thumbnails" target="_blank">
							<translate>dash.games.thumbnail.page_help_link</translate>
						</a>
					</p>
				</div>
			</div>
			<div class="col-sm-6">
				<app-editable-overlay class="-thumb-overlay" @click="showEditThumbnail()">
					<span slot="overlay">
						<translate v-if="!model.thumbnail_media_item">Upload Thumbnail</translate>
						<translate v-else>Change Thumbnail</translate>
					</span>
					<app-game-thumbnail-img animate :game="model" />
				</app-editable-overlay>
			</div>
		</div>

		<div v-if="hasThumbnailError" class="alert alert-notice">
			<translate>You must upload a thumbnail for your game.</translate>
		</div>

		<hr />

		<app-form-group name="theme" :label="$gettext(`Color Theme`)">
			<app-form-control-theme class="pull-right" @changed="onThemeChanged()" />
			<p class="help-block">
				<translate>
					Give your page a splash of color! When people view your game page, they'll be switched to
					this theme.
				</translate>
			</p>
		</app-form-group>

		<app-dash-game-wizard-controls>
			<app-form-button>
				<translate>Save</translate>
			</app-form-button>
		</app-dash-game-wizard-controls>
	</app-form>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-thumb-overlay
	rounded-corners()
	overflow: hidden
</style>

<script lang="ts" src="./design" />
