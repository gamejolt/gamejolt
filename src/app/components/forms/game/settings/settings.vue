<script lang="ts">
import { mixins, Options } from 'vue-property-decorator';
import AppFormControlToggle from '../../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import { BaseForm, FormOnLoad } from '../../../../../_common/form-vue/form.service';
import { validateGaTrackingId } from '../../../../../_common/form-vue/validators';
import { Game } from '../../../../../_common/game/game.model';
import AppDashGameWizardControls from '../wizard-controls/wizard-controls.vue';

class Wrapper extends BaseForm<Game> {}

@Options({
	components: {
		AppFormControlToggle,
		AppDashGameWizardControls,
	},
})
export default class FormGameSettings extends mixins(Wrapper) implements FormOnLoad {
	modelClass = Game;
	saveMethod = '$saveSettings' as const;

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
		<AppFormGroup v-if="!hasPackagesForSale" name="ads_enabled" :label="$gettext(`Show ads?`)">
			<template #inline-control>
				<AppFormControlToggle />
			</template>

			<div class="help-block">
				<p>
					<strong>
						<AppTranslate>
							Turning this off will remove all ads for this game.
						</AppTranslate>
					</strong>
				</p>
				<p>
					<AppTranslate>
						Only do this if you don't want your game monetized, or if your game is
						subject to a license that doesn't allow monetization.
					</AppTranslate>
				</p>
			</div>
		</AppFormGroup>
		<div v-else class="form-group">
			<label class="control-label">
				<AppTranslate>Show ads?</AppTranslate>
			</label>
			<div class="alert">
				<AppTranslate v-if="hasPackagesForSale">
					We don't show ads on Marketplace game pages (even for pay what you want games).
				</AppTranslate>
			</div>
		</div>

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
