<script lang="ts">
import { mixins, Options, Prop, Watch } from 'vue-property-decorator';
import { ContentDocument } from '../../../../../_common/content/content-document';
import { ContentWriter } from '../../../../../_common/content/content-writer';
import AppExpand from '../../../../../_common/expand/AppExpand.vue';
import AppFormControlContent from '../../../../../_common/form-vue/controls/AppFormControlContent.vue';
import {
	BaseForm,
	FormOnLoad,
	FormOnSubmitSuccess,
} from '../../../../../_common/form-vue/form.service';
import {
	validateContentMaxLength,
	validateContentNoActiveUploads,
	validateContentRequired,
} from '../../../../../_common/form-vue/validators';
import { Game } from '../../../../../_common/game/game.model';
import { AppGamePerms } from '../../../game/perms/perms';
import AppDashGameWizardControls from '../wizard-controls/wizard-controls.vue';
import AppFormGameDescriptionTags from './tags/tags.vue';

type DescriptionFormModel = Game & {
	autotag?: string;
	autotag_skip?: boolean;
};

class Wrapper extends BaseForm<DescriptionFormModel> {}

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
	extends mixins(Wrapper)
	implements FormOnSubmitSuccess, FormOnLoad
{
	@Prop(Array)
	tags!: string[];

	modelClass = Game;
	saveMethod = '$saveDescription' as const;

	isFnafDetected = false;
	isDisabled = false;
	lengthLimit = 50_000;

	readonly validateContentRequired = validateContentRequired;
	readonly validateContentMaxLength = validateContentMaxLength;
	readonly validateContentNoActiveUploads = validateContentNoActiveUploads;

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

	@Watch('serverErrors', { deep: true })
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
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup name="description_content" :label="$gettext('Description')">
			<template #label>
				<AppJolticon icon="edit" />
				<strong>
					<AppTranslate>Game Description</AppTranslate>
				</strong>
			</template>

			<AppFormControlContent
				:placeholder="$gettext(`Write your game description here...`)"
				content-context="game-description"
				:model-id="model.id"
				:validators="[
					validateContentRequired(),
					validateContentNoActiveUploads(),
					validateContentMaxLength(lengthLimit),
				]"
				:max-height="0"
			/>

			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormGameDescriptionTags
			class="-tags"
			:text="tagText"
			:tags="tags"
			:content="contentDocument"
			@tag="addTag($event)"
		/>

		<AppExpand :when="isFnafDetected">
			<div class="alert alert-notice">
				<div v-translate>
					<strong>
						It appears that your game may be a Five Nights at Freddy's fan game,
						spinoff, or unofficial sequel.
					</strong>
					Therefore, we have added the hashtag
					<code>#fnaf</code>
					to your game's description. We require this tag for all games derived from the
					Five Nights at Freddy's series.
				</div>

				<AppGamePerms required="details" tag="div" class="alert-actions">
					<AppFormButton
						:solid="false"
						trans
						icon="tag"
						@before-submit="addAutotag('fnaf')"
					>
						<AppTranslate>dash.games.add.fnaf_autotag_accept</AppTranslate>
					</AppFormButton>

					<AppFormButton
						:solid="false"
						:primary="false"
						trans
						@before-submit="skipAutotag()"
					>
						<AppTranslate>dash.games.add.fnaf_autotag_reject</AppTranslate>
					</AppFormButton>
				</AppGamePerms>
			</div>
		</AppExpand>

		<AppGamePerms required="details">
			<AppDashGameWizardControls v-if="!isFnafDetected">
				<AppFormButton>
					<AppTranslate>Save Description</AppTranslate>
				</AppFormButton>
			</AppDashGameWizardControls>
		</AppGamePerms>
	</AppForm>
</template>

<style lang="stylus" scoped>
@import '../../../../../_styles/common/forms'

.-label
	margin-bottom: $form-common-spacing

.-tags
	margin-bottom: $line-height-computed
</style>
