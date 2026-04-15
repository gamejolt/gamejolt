<script lang="ts" setup>
import { computed, onUnmounted, toRef, watch } from 'vue';

import AppEditableOverlay from '../../../../../_common/editable-overlay/AppEditableOverlay.vue';
import AppForm, { createForm, FormController } from '../../../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../../../_common/form-vue/AppFormButton.vue';
import AppFormGroup from '../../../../../_common/form-vue/AppFormGroup.vue';
import AppFormControlTheme from '../../../../../_common/form-vue/controls/AppFormControlTheme.vue';
import { $saveGameDesign, GameModel } from '../../../../../_common/game/game.model';
import AppGameThumbnailImg from '../../../../../_common/game/thumbnail/AppGameThumbnailImg.vue';
import AppLinkHelp from '../../../../../_common/link/AppLinkHelp.vue';
import { DefaultTheme } from '../../../../../_common/theme/theme.model';
import { useThemeStore } from '../../../../../_common/theme/theme.store';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';
import { showGameThumbnailModal } from '../../../game/thumbnail-modal/thumbnail-modal.service';
import AppDashGameWizardControls from '../wizard-controls/AppDashGameWizardControls.vue';

type FormModel = GameModel;

type Props = {
	model?: GameModel;
};

const props = defineProps<Props>();
const themeStore = useThemeStore();

const emit = defineEmits<{
	submit: [];
}>();

const form: FormController<FormModel> = createForm<FormModel>({
	model: toRef(props, 'model'),
	modelClass: GameModel,
	modelSaveHandler: $saveGameDesign,
	onSubmitSuccess() {
		emit('submit');
	},
});

const hasThumbnailError = computed(() => form.hasCustomError('thumbnail'));

watch(
	() => props.model?.thumbnail_media_item,
	(mediaItem: any) => {
		if (!mediaItem) {
			form.setCustomError('thumbnail');
		} else {
			form.clearCustomError('thumbnail');
		}
	},
	{ immediate: true }
);

onUnmounted(() => {
	themeStore.setFormTheme(null);
});

function showEditThumbnail() {
	showGameThumbnailModal(props.model!);
}

function onThemeChanged() {
	// Default theme would be the user theme. Don't want to fallback to page theme otherwise
	// when clearing theme it'll show the page theme.
	themeStore.setFormTheme(form.formModel.theme ?? themeStore.userTheme.value ?? DefaultTheme);
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
				<AppEditableOverlay class="-thumb-overlay" @toggle="showEditThumbnail()">
					<template #overlay>
						<span>
							<AppTranslate v-if="!model || !model.thumbnail_media_item">
								Upload Thumbnail
							</AppTranslate>
							<AppTranslate v-else>Change Thumbnail</AppTranslate>
						</span>
					</template>
					<AppGameThumbnailImg animate :game="model!" />
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
