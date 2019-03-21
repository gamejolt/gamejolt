import AppExpand from 'game-jolt-frontend-lib/components/expand/expand.vue';
import AppFormControlMarkdownTS from 'game-jolt-frontend-lib/components/form-vue/control/markdown/markdown';
import AppFormControlMarkdown from 'game-jolt-frontend-lib/components/form-vue/control/markdown/markdown.vue';
import AppForm from 'game-jolt-frontend-lib/components/form-vue/form';
import { BaseForm } from 'game-jolt-frontend-lib/components/form-vue/form.service';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { AppGamePerms } from '../../../game/perms/perms';
import AppDashGameWizardControls from '../wizard-controls/wizard-controls.vue';
import AppFormGameDescriptionTags from './tags/tags.vue';

type DescriptionFormModel = Game & {
	autotag?: string;
	autotag_skip?: boolean;
};

@Component({
	components: {
		AppExpand,
		AppFormControlMarkdown,
		AppDashGameWizardControls,
		AppGamePerms,
		AppFormGameDescriptionTags,
	},
})
export default class FormGameDescription extends BaseForm<DescriptionFormModel> {
	@Prop(Array)
	tags!: string[];

	modelClass = Game;
	saveMethod = '$saveDescription' as '$saveDescription';

	isFnafDetected = false;
	isDisabled = false;

	$refs!: {
		form: AppForm;
		editor: AppFormControlMarkdownTS;
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
		const newDescription = this.formModel.description_markdown
			? `${this.formModel.description_markdown} #${tag}`
			: `#${tag}`;
		this.setField('description_markdown', newDescription);

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
