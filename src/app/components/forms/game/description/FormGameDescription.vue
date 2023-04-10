<script lang="ts" setup>
import { computed, PropType, ref, toRefs, watch } from 'vue';
import { ContextCapabilities } from '../../../../../_common/content/content-context';
import { ContentDocument } from '../../../../../_common/content/content-document';
import { ContentWriter } from '../../../../../_common/content/content-writer';
import AppExpand from '../../../../../_common/expand/AppExpand.vue';
import AppForm, {
	createForm,
	defineFormProps,
	FormController,
} from '../../../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../../../_common/form-vue/AppFormButton.vue';
import AppFormControlErrors from '../../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../../_common/form-vue/AppFormGroup.vue';
import AppFormControlContent from '../../../../../_common/form-vue/controls/AppFormControlContent.vue';
import {
	validateContentMaxLength,
	validateContentNoActiveUploads,
	validateContentRequired,
} from '../../../../../_common/form-vue/validators';
import { Game } from '../../../../../_common/game/game.model';
import AppJolticon from '../../../../../_common/jolticon/AppJolticon.vue';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';
import { AppGamePerms } from '../../../game/perms/perms';
import AppDashGameWizardControls from '../wizard-controls/wizard-controls.vue';
import AppFormGameDescriptionTags from './tags/tags.vue';

type DescriptionFormModel = Game & {
	autotag?: string;
	autotag_skip?: boolean;
};

const props = defineProps({
	tags: {
		type: Array as PropType<string[]>,
		required: true,
	},
	...defineFormProps<Game>(true),
});

const { tags, model } = toRefs(props);

const isFnafDetected = ref(false);
const isDisabled = ref(false);
const lengthLimit = ref(50_000);
const descriptionContentCapabilities = ref(ContextCapabilities.getPlaceholder());

const form: FormController<DescriptionFormModel> = createForm({
	loadUrl: `/web/dash/developer/games/description/save/${model.value.id}`,
	model,
	modelClass: Game,
	saveMethod: '$saveDescription' as const,
	onLoad(payload) {
		lengthLimit.value = payload.lengthLimit;

		descriptionContentCapabilities.value = ContextCapabilities.fromPayloadList(
			payload.contentCapabilities
		);
	},
	onSubmitSuccess() {
		form.formModel.autotag = undefined;
	},
});

const contentDocument = computed(() => {
	if (form.formModel.description_content) {
		const doc = ContentDocument.fromJson(form.formModel.description_content);
		return doc;
	}
	return null;
});

const tagText = computed(() => form.formModel.title.toLowerCase());

watch(
	() => form.serverErrors,
	() => {
		isFnafDetected.value = false;
		isDisabled.value = false;
		if (form.serverErrors['autotag-fnaf']) {
			// This will make it so they can't edit the form and force them to choose if they want to tag or not.
			isFnafDetected.value = true;
			isDisabled.value = true;
		}
	},
	{
		deep: true,
	}
);

async function addTag(tag: string) {
	const doc = contentDocument.value;
	if (doc instanceof ContentDocument) {
		const writer = new ContentWriter(doc);
		writer.appendTag(tag);

		form.formModel.description_content = doc.toJson();
	}
}

function addAutotag(tag: string) {
	form.formModel.autotag = tag;
}

function skipAutotag() {
	form.formModel.autotag_skip = true;
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
				:capabilities="descriptionContentCapabilities"
				:model-data="{
					type: 'resource',
					resource: 'Game',
					resourceId: model.id,
				}"
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
						<AppTranslate
							translate-comment="Used to accept an automatic tag suggestion for a game"
						>
							Okay
						</AppTranslate>
					</AppFormButton>

					<AppFormButton
						:solid="false"
						:primary="false"
						trans
						@before-submit="skipAutotag()"
					>
						<AppTranslate>Don't Tag</AppTranslate>
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
