import { ContentContainer } from 'game-jolt-frontend-lib/components/content/content-container';
import ContentWriter from 'game-jolt-frontend-lib/components/content/content-writer';
import AppExpand from 'game-jolt-frontend-lib/components/expand/expand.vue';
import AppFormControlContent from 'game-jolt-frontend-lib/components/form-vue/control/content/content.vue';
import { BaseForm } from 'game-jolt-frontend-lib/components/form-vue/form.service';
import AppForm from 'game-jolt-frontend-lib/components/form-vue/form.vue';
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
		AppDashGameWizardControls,
		AppGamePerms,
		AppFormGameDescriptionTags,
		AppFormControlContent,
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
	};

	get hasDetailsPerms() {
		return this.model && this.model.hasPerms('details');
	}

	get contentContainer() {
		if (this.formModel.description_content) {
			const container = ContentContainer.fromJson(this.formModel.description_content);
			return container;
		}
		return null;
	}

	get tagText() {
		return this.formModel.title.toLowerCase();
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
		const container = this.contentContainer;
		if (container instanceof ContentContainer) {
			const writer = new ContentWriter(container);
			writer.appendTag(tag);

			this.setField('description_content', container.toJson());
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
