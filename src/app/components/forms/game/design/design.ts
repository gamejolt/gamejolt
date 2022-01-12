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
