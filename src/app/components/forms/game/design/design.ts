import { Component, Watch } from 'vue-property-decorator';
import View from '!view!./design.html?style=./design.styl';

import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { BaseForm } from '../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { AppFormControlTheme } from '../../../../../lib/gj-lib-client/components/form-vue/control/theme/theme';
import {
	ThemeMutation,
	ThemeStore,
	ThemeState,
} from '../../../../../lib/gj-lib-client/components/theme/theme.store';
import { Theme } from '../../../../../lib/gj-lib-client/components/theme/theme.model';
import { AppDashGameWizardControls } from '../wizard-controls/wizard-controls';
import { AppEditableOverlay } from '../../../../../lib/gj-lib-client/components/editable-overlay/editable-overlay';
import { AppGameThumbnailImg } from '../../../../../lib/gj-lib-client/components/game/thumbnail-img/thumbnail-img';
import { GameThumbnailModal } from '../../../game/thumbnail-modal/thumbnail-modal.service';

@View
@Component({
	components: {
		AppFormControlTheme,
		AppEditableOverlay,
		AppGameThumbnailImg,
		AppDashGameWizardControls,
	},
})
export class FormGameDesign extends BaseForm<Game> {
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
