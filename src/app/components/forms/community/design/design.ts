import View from '!view!./design.html';
import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import { AppCommunityThumbnailImg } from 'game-jolt-frontend-lib/components/community/thumbnail/img/img';
import { AppEditableOverlay } from 'game-jolt-frontend-lib/components/editable-overlay/editable-overlay';
import { AppFormControlTheme } from 'game-jolt-frontend-lib/components/form-vue/control/theme/theme';
import { BaseForm } from 'game-jolt-frontend-lib/components/form-vue/form.service';
import { Theme } from 'game-jolt-frontend-lib/components/theme/theme.model';
import {
	ThemeMutation,
	ThemeState,
	ThemeStore,
} from 'game-jolt-frontend-lib/components/theme/theme.store';
import { Component, Watch } from 'vue-property-decorator';
import { CommunityThumbnailModal } from '../thumbnail-modal/thumbnail-modal.service';
import { AppDashCommunityWizardControls } from '../wizard-controls/wizard-controls';

@View
@Component({
	components: {
		AppFormControlTheme,
		AppEditableOverlay,
		AppCommunityThumbnailImg,
		AppDashCommunityWizardControls,
	},
})
export class FormCommunityDesign extends BaseForm<Community> {
	modelClass = Community as any;
	saveMethod: '$saveDesign' = '$saveDesign';

	@ThemeState
	userTheme!: ThemeStore['userTheme'];
	@ThemeMutation
	setFormTheme!: ThemeStore['setFormTheme'];

	get hasThumbnailError() {
		return this.hasCustomError('thumbnail');
	}

	destroyed() {
		this.setFormTheme(null);
	}

	showEditThumbnail() {
		CommunityThumbnailModal.show(this.model!);
	}

	@Watch('model.thumbnail', { immediate: true })
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
