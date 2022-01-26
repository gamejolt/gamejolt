<script lang="ts">
import { mixins, Options } from 'vue-property-decorator';
import { Community } from '../../../../../_common/community/community.model';
import AppFormControlContent from '../../../../../_common/form-vue/controls/AppFormControlContent.vue';
import { BaseForm, FormOnLoad } from '../../../../../_common/form-vue/form.service';
import {
	validateContentMaxLength,
	validateContentNoActiveUploads,
	validateContentRequired,
} from '../../../../../_common/form-vue/validators';

class Wrapper extends BaseForm<Community> {}

@Options({
	components: {
		AppFormControlContent,
	},
})
export default class FormCommunityDescription extends mixins(Wrapper) implements FormOnLoad {
	modelClass = Community;
	saveMethod = '$saveDescription' as const;
	lengthLimit = 5_000;

	readonly validateContentRequired = validateContentRequired;
	readonly validateContentMaxLength = validateContentMaxLength;
	readonly validateContentNoActiveUploads = validateContentNoActiveUploads;

	get loadUrl() {
		return `/web/dash/communities/description/save/${this.model!.id}`;
	}

	onLoad(payload: any) {
		this.lengthLimit = payload.lengthLimit;
		this.setField('description_content', this.model?.description_content ?? '');
	}
}
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup name="description_content" hide-label>
			<AppFormControlContent
				:placeholder="$gettext(`Write your community description here...`)"
				content-context="community-description"
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

		<AppFormButton show-when-valid>
			<AppTranslate>Save Description</AppTranslate>
		</AppFormButton>
	</AppForm>
</template>
