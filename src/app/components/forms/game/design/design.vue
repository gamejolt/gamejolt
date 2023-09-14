<script lang="ts">
import { setup } from 'vue-class-component';
import { mixins, Options, Watch } from 'vue-property-decorator';
import AppEditableOverlay from '../../../../../_common/editable-overlay/AppEditableOverlay.vue';
import AppFormControlTheme from '../../../../../_common/form-vue/controls/AppFormControlTheme.vue';
import { BaseForm } from '../../../../../_common/form-vue/form.service';
import { $saveGameDesign, GameModel } from '../../../../../_common/game/game.model';
import AppGameThumbnailImg from '../../../../../_common/game/thumbnail/AppGameThumbnailImg.vue';
import { DefaultTheme } from '../../../../../_common/theme/theme.model';
import { useThemeStore } from '../../../../../_common/theme/theme.store';
import { showGameThumbnailModal } from '../../../game/thumbnail-modal/thumbnail-modal.service';
import AppDashGameWizardControls from '../wizard-controls/wizard-controls.vue';

class Wrapper extends BaseForm<GameModel> {}

@Options({
	components: {
		AppFormControlTheme,
		AppEditableOverlay,
		AppGameThumbnailImg,
		AppDashGameWizardControls,
	},
})
export default class FormGameDesign extends mixins(Wrapper) {
	modelClass = GameModel as any;
	modelSaveHandler = $saveGameDesign;

	themeStore = setup(() => useThemeStore());

	get hasThumbnailError() {
		return this.hasCustomError('thumbnail');
	}

	unmounted() {
		this.themeStore.setFormTheme(null);
	}

	showEditThumbnail() {
		showGameThumbnailModal(this.model!);
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
	<AppForm :controller="form">
		<div class="row">
			<div class="col-sm-6">
				<h4 class="sans-margin-top">
					<AppTranslate>Game Thumbnail</AppTranslate>
				</h4>

				<div class="page-help">
					<p>
						<AppTranslate>
							A thumbnail is the little rectangular image that represents your game
							throughout the site. People can click it in game listings and search
							results to get to your game page.
						</AppTranslate>
					</p>
					<p>
						<AppTranslate>
							Please don't choose an image that contains nudity, swear words, or
							adult-oriented imagery.
						</AppTranslate>
					</p>
					<p>
						<AppLinkHelp page="dev-thumbnails" class="link-help">
							<AppTranslate>
								What are the thumbnail requirements and guidelines?
							</AppTranslate>
						</AppLinkHelp>
					</p>
				</div>
			</div>
			<div class="col-sm-6">
				<AppEditableOverlay class="-thumb-overlay" @click="showEditThumbnail()">
					<template #overlay>
						<span>
							<AppTranslate v-if="!model.thumbnail_media_item">
								Upload Thumbnail
							</AppTranslate>
							<AppTranslate v-else>Change Thumbnail</AppTranslate>
						</span>
					</template>
					<AppGameThumbnailImg animate :game="model" />
				</AppEditableOverlay>
			</div>
		</div>

		<div v-if="hasThumbnailError" class="alert alert-notice">
			<AppTranslate>You must upload a thumbnail for your game.</AppTranslate>
		</div>

		<hr />

		<AppFormGroup name="theme" :label="$gettext(`Color Theme`)">
			<template #inline-control>
				<AppFormControlTheme @changed="onThemeChanged()" />
			</template>

			<p class="help-block">
				<AppTranslate>
					Give your page a splash of color! When people view your game page, they'll be
					switched to this theme.
				</AppTranslate>
			</p>
		</AppFormGroup>

		<AppDashGameWizardControls>
			<AppFormButton>
				<AppTranslate>Save</AppTranslate>
			</AppFormButton>
		</AppDashGameWizardControls>
	</AppForm>
</template>

<style lang="stylus" scoped>
.-thumb-overlay
	rounded-corners-lg()
	overflow: hidden
</style>
