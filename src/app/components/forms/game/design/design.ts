import { Options, Watch } from 'vue-property-decorator';
import AppEditableOverlay from '../../../../../_common/editable-overlay/editable-overlay.vue';
import AppFormControlTheme from '../../../../../_common/form-vue/control/theme/theme.vue';
import { BaseForm } from '../../../../../_common/form-vue/form.service';
import { Game } from '../../../../../_common/game/game.model';
import AppGameThumbnailImg from '../../../../../_common/game/thumbnail-img/thumbnail-img.vue';
import { Theme } from '../../../../../_common/theme/theme.model';
import { ThemeMutation, ThemeState, ThemeStore } from '../../../../../_common/theme/theme.store';
import { GameThumbnailModal } from '../../../game/thumbnail-modal/thumbnail-modal.service';
import AppDashGameWizardControls from '../wizard-controls/wizard-controls.vue';

@Options({
	components: {
		AppFormControlTheme,
		AppEditableOverlay,
		AppGameThumbnailImg,
		AppDashGameWizardControls,
	},
})
export default class FormGameDesign extends BaseForm<Game> {
	modelClass = Game as any;
	saveMethod: '$saveDesign' = '$saveDesign';

	@ThemeState userTheme!: ThemeStore['userTheme'];
	@ThemeMutation setFormTheme!: ThemeStore['setFormTheme'];

	get hasThumbnailError() {
		return this.hasCustomError('thumbnail');
	}

	destroyed() {
		this.setFormTheme(null);
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
		this.setFormTheme(this.formModel.theme || this.userTheme || new Theme());
	}
}
