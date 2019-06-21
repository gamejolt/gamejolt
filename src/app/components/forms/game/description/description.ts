import { ContentDocument } from 'game-jolt-frontend-lib/components/content/content-document';
import { ContentWriter } from 'game-jolt-frontend-lib/components/content/content-writer';
import AppExpand from 'game-jolt-frontend-lib/components/expand/expand.vue';
import AppFormControlContent from 'game-jolt-frontend-lib/components/form-vue/control/content/content.vue';
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

	get contentDocument() {
		if (this.formModel.description_content) {
			const doc = ContentDocument.fromJson(this.formModel.description_content);
			return doc;
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
		const doc = this.contentDocument;
		if (doc instanceof ContentDocument) {
			const writer = new ContentWriter(doc);
			writer.appendTag(tag);

			this.setField('description_content', doc.toJson());
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
