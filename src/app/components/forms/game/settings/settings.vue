<script lang="ts">
import { mixins, Options } from 'vue-property-decorator';
import AppFormControlToggle from '../../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import { BaseForm, FormOnLoad } from '../../../../../_common/form-vue/form.service';
import { validateGaTrackingId } from '../../../../../_common/form-vue/validators';
import { $saveGameSettings, GameModel } from '../../../../../_common/game/game.model';
import AppDashGameWizardControls from '../wizard-controls/AppDashGameWizardControls.vue';

class Wrapper extends BaseForm<GameModel> {}

@Options({
	components: {
		AppFormControlToggle,
		AppDashGameWizardControls,
	},
})
export default class FormGameSettings extends mixins(Wrapper) implements FormOnLoad {
	modelClass = GameModel;
	modelSaveHandler = $saveGameSettings;

	hasPackagesForSale = false;

	readonly validateGaTrackingId = validateGaTrackingId;

	get loadUrl() {
		return `/web/dash/developer/games/settings/save/${this.model!.id}`;
	}

	onLoad(payload: any) {
		this.hasPackagesForSale = payload.hasPackagesForSale;
	}
}
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup name="comments_enabled" :label="$gettext(`Allow comments?`)">
			<template #inline-control>
				<AppFormControlToggle />
			</template>

			<div class="help-block">
				<p>
					<strong>
						<AppTranslate>
							Turning this off will disable comments for this game and hide any
							comments already on the page.
						</AppTranslate>
					</strong>
				</p>

				<p>
					<AppTranslate>
						The community will no longer be able to give you feedback via comments, but
						you may prefer this if your game contains sensitive or controversial
						material.
					</AppTranslate>
				</p>

				<p>
					<AppTranslate>
						This will never remove comments from your game page—merely hide them. If you
						allow comments again in the future, all previously hidden comments will be
						restored.
					</AppTranslate>
				</p>
			</div>
		</AppFormGroup>

		<AppFormGroup name="ratings_enabled" :label="$gettext('Allow ratings?')">
			<template #inline-control>
				<AppFormControlToggle />
			</template>

			<div class="help-block">
				<p>
					<strong>
						<AppTranslate>
							Turning this off will disable ratings for this game and hide any ratings
							already on the page.
						</AppTranslate>
					</strong>
				</p>
				<p>
					<AppTranslate>
						Your game's voltage will be calculated as if it had received no likes or
						dislikes. If you allow ratings in the future, the old ratings will be
						reapplied and your voltage will be recalculated.
					</AppTranslate>
				</p>
			</div>
		</AppFormGroup>

		<AppDashGameWizardControls>
			<AppFormButton>
				<AppTranslate>Save Settings</AppTranslate>
			</AppFormButton>
		</AppDashGameWizardControls>
	</AppForm>
</template>
