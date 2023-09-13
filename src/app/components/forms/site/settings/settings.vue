<script lang="ts">
import { mixins, Options } from 'vue-property-decorator';
import { BaseForm } from '../../../../../_common/form-vue/form.service';
import { validateGaTrackingId } from '../../../../../_common/form-vue/validators';
import { $saveSite, SiteModel } from '../../../../../_common/site/site-model';

class Wrapper extends BaseForm<SiteModel> {}

@Options({})
export default class FormSiteSettings extends mixins(Wrapper) {
	modelClass = SiteModel;
	modelSaveHandler = $saveSite;

	readonly validateGaTrackingId = validateGaTrackingId;
}
</script>

import { validateGaTrackingId } from '../../../../../_common/form-vue/validators';
<template>
	<AppForm :controller="form">
		<AppFormGroup name="title" :label="$gettext(`Page Title`)" :optional="true">
			<div class="help-block" v-if="!formModel.game_id">
				<AppTranslate>
					You can override the default title for your site. This will show in search
					engines, and in the tab bar of browsers. By default it's your display name.
				</AppTranslate>
			</div>
			<div class="help-block" v-else>
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
