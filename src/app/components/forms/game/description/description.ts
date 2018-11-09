import View from '!view!./description.html';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { AppExpand } from '../../../../../lib/gj-lib-client/components/expand/expand';
import { AppFormControlMarkdown } from '../../../../../lib/gj-lib-client/components/form-vue/control/markdown/markdown';
import { AppForm } from '../../../../../lib/gj-lib-client/components/form-vue/form';
import { BaseForm } from '../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { AppGamePerms } from '../../../game/perms/perms';
import { AppDashGameWizardControls } from '../wizard-controls/wizard-controls';
import { AppFormGameDescriptionTags } from './tags/tags';

type DescriptionFormModel = Game & {
	autotag?: string;
	autotag_skip?: boolean;
};

@View
@Component({
	components: {
		AppExpand,
		AppFormControlMarkdown,
		AppDashGameWizardControls,
		AppGamePerms,
		AppFormGameDescriptionTags,
	},
})
export class FormGameDescription extends BaseForm<DescriptionFormModel> {
	@Prop(Array)
	tags!: string[];

	modelClass = Game;
	saveMethod = '$saveDescription' as '$saveDescription';

	isFnafDetected = false;
	isDisabled = false;

	$refs!: {
		form: AppForm;
		editor: AppFormControlMarkdown;
	};

	get hasDetailsPerms() {
		return this.model && this.model.hasPerms('details');
	}

	get tagText() {
		return (this.formModel.title + ' ' + this.formModel.description_markdown).toLowerCase();
	}

	@Watch('serverErrors')
	onServerErrors() {
		this.isFnafDetected = false;
		this.isDisabled = false;
		if (this.serverErrors['autotag-fnaf']) {
			// This will make it so they can't edit the form and force them to choose if they want to tag or not.
			this.isFnafDetected = true;
			this.isDisabled = true;
		}
	}

	async addTag(tag: string) {
		this.setField('description_markdown', this.formModel.description_markdown + ' #' + tag);

		// Since we are modifying the description outside the normal flow, we
		// have to tell the autosizer to try to update itself.
		if (this.$refs.editor) {
			await this.$nextTick();
			this.$refs.editor.updateAutosize();
		}
	}

	addAutotag(tag: string) {
		this.setField('autotag', tag);
		this.$refs.form.submit();
	}

	skipAutotag() {
		this.setField('autotag_skip', true);
		this.$refs.form.submit();
	}
}
