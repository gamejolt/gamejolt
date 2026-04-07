<script lang="ts" setup>
import { toRef } from 'vue';
import AppForm, { createForm, FormController } from '../../../../../_common/form-vue/AppForm.vue';
import { validateGaTrackingId } from '../../../../../_common/form-vue/validators';
import { $saveSite, SiteModel } from '../../../../../_common/site/site-model';

type Props = {
	model?: SiteModel;
};

const { model } = defineProps<Props>();

const form: FormController<SiteModel> = createForm({
	model: toRef(() => model),
	modelClass: SiteModel,
	modelSaveHandler: $saveSite,
});
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup name="title" :label="$gettext(`Page Title`)" :optional="true">
			<div v-if="!form.formModel.game_id" class="help-block">
				<AppTranslate>
					You can override the default title for your site. This will show in search
					engines, and in the tab bar of browsers. By default it's your display name.
				</AppTranslate>
			</div>
			<div v-else class="help-block">
				<AppTranslate>
					You can override the default title for your site. This will show in search
					engines, and in the tab bar of browsers. By default it's the title of your game.
				</AppTranslate>
			</div>

			<AppFormControl :validators="[validateMaxLength(100)]" />
			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormGroup name="description" :label="$gettext(`Description`)" :optional="true">
			<div class="help-block">
				<AppTranslate>
					Search engines show this as the description under the page title in search
					results.
				</AppTranslate>
			</div>
			<AppFormControlTextarea rows="3" :validators="[validateMaxLength(250)]" />
			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormGroup
			name="ga_tracking_id"
			:label="$gettext(`Google Analytics Tracking ID`)"
			:optional="true"
		>
			<AppFormControl
				:validators="[validateMaxLength(30), validateGaTrackingId()]"
				:placeholder="$gettext(`Example: UA-1234567-1`)"
			/>

			<AppFormControlErrors :label="$gettext(`tracking ID`)" />

			<div class="help-block">
				<p>
					<AppTranslate>
						Use Google Analytics to track a multitude of stats and get tons of
						information about your site. Just enter your Google Analytics tracking ID
						here and we'll start sending data over there right away.
					</AppTranslate>
				</p>
				<p>
					<AppLinkExternal
						class="link-help"
						href="https://support.google.com/analytics/answer/1008080"
					>
						<AppTranslate>How do I get my tracking ID?</AppTranslate>
					</AppLinkExternal>
				</p>
			</div>
		</AppFormGroup>

		<AppFormButton>
			<AppTranslate>Save</AppTranslate>
		</AppFormButton>
	</AppForm>
</template>
