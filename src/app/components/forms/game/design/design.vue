<script lang="ts">
import { setup } from 'vue-class-component';
import { mixins, Options, Watch } from 'vue-property-decorator';
import AppEditableOverlay from '../../../../../_common/editable-overlay/editable-overlay.vue';
import AppFormControlTheme from '../../../../../_common/form-vue/controls/AppFormControlTheme.vue';
import { BaseForm } from '../../../../../_common/form-vue/form.service';
import { Game } from '../../../../../_common/game/game.model';
import AppGameThumbnailImg from '../../../../../_common/game/thumbnail-img/thumbnail-img.vue';
import { DefaultTheme } from '../../../../../_common/theme/theme.model';
import { useThemeStore } from '../../../../../_common/theme/theme.store';
import { GameThumbnailModal } from '../../../game/thumbnail-modal/thumbnail-modal.service';
import AppDashGameWizardControls from '../wizard-controls/wizard-controls.vue';

class Wrapper extends BaseForm<Game> {}

@Options({
	components: {
		AppFormControlTheme,
		AppEditableOverlay,
		AppGameThumbnailImg,
		AppDashGameWizardControls,
	},
})
export default class FormGameDesign extends mixins(Wrapper) {
	modelClass = Game as any;
	saveMethod = '$saveDesign' as const;

	themeStore = setup(() => useThemeStore());

	get hasThumbnailError() {
		return this.hasCustomError('thumbnail');
	}

	unmounted() {
		this.themeStore.setFormTheme(null);
	}

	showEditThumbnail() {
		GameThumbnailModal.show(this.model!);
	}

	@Watch('model.thumbnail_media_item', { immediate: true })
	onDimensionsChanged(mediaItem: any) {
		if (!mediaItem) {
			this.setCustomError('thumbnail');
		} else {
			this.clearCustomError('thumbnail');
		}
	}

	onThemeChanged() {
		// Default theme would be the user theme. Don't want to fallback to page theme otherwise
		// when clearing theme it'll show the page theme.
		this.themeStore.setFormTheme(
			this.formModel.theme ?? this.themeStore.userTheme ?? DefaultTheme
		);
	}
}
</script>

<template>
	<app-form :controller="form">
		<div class="row">
			<div class="col-sm-6">
				<h4 class="sans-margin-top">
					<translate>Game Thumbnail</translate>
				</h4>

				<div class="page-help">
					<p>
						<translate>
							A thumbnail is the little rectangular image that represents your game
							throughout the site. People can click it in game listings and search
							results to get to your game page.
						</translate>
					</p>
					<p>
						<translate>
							Please don't choose an image that contains nudity, swear words, or
							adult-oriented imagery.
						</translate>
					</p>
					<p>
						<app-link-help page="dev-thumbnails" class="link-help">
							<translate>dash.games.thumbnail.page_help_link</translate>
						</app-link-help>
					</p>
				</div>
			</div>
			<div class="col-sm-6">
				<app-editable-overlay class="-thumb-overlay" @click="showEditThumbnail()">
					<template #overlay>
						<span>
							<translate v-if="!model.thumbnail_media_item">
								Upload Thumbnail
							</translate>
							<translate v-else>Change Thumbnail</translate>
						</span>
					</template>
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
					Give your page a splash of color! When people view your game page, they'll be
					switched to this theme.
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
.-thumb-overlay
	rounded-corners-lg()
	overflow: hidden
</style>
