import { Options, Prop, Watch } from 'vue-property-decorator';
import { ContentDocument } from '../../../../../_common/content/content-document';
import { ContentWriter } from '../../../../../_common/content/content-writer';
import AppExpand from '../../../../../_common/expand/expand.vue';
import AppFormControlContent from '../../../../../_common/form-vue/control/content/content.vue';
import AppForm from '../../../../../_common/form-vue/form';
import {
	BaseForm,
	FormOnLoad,
	FormOnSubmitSuccess,
} from '../../../../../_common/form-vue/form.service';
import { Game } from '../../../../../_common/game/game.model';
import { AppGamePerms } from '../../../game/perms/perms';
import AppDashGameWizardControls from '../wizard-controls/wizard-controls.vue';
import AppFormGameDescriptionTags from './tags/tags.vue';

type DescriptionFormModel = Game & {
	autotag?: string;
	autotag_skip?: boolean;
};

@Options({
	components: {
		AppExpand,
		AppDashGameWizardControls,
		AppGamePerms,
		AppFormGameDescriptionTags,
		AppFormControlContent,
	},
})
export default class FormGameDescription
	extends BaseForm<DescriptionFormModel>
	implements FormOnSubmitSuccess, FormOnLoad
{
	@Prop(Array)
	tags!: string[];

	modelClass = Game;
	saveMethod = '$saveDescription' as '$saveDescription';

	isFnafDetected = false;
	isDisabled = false;
	lengthLimit = 50_000;

	declare $refs: {
		form: AppForm;
	};

	get loadUrl() {
		return `/web/dash/developer/games/description/save/${this.model!.id}`;
	}

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

	onLoad(payload: any) {
		this.lengthLimit = payload.lengthLimit;
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

	onSubmitSuccess() {
		this.setField('autotag', undefined);
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
	}

	skipAutotag() {
		this.setField('autotag_skip', true);
	}
}
