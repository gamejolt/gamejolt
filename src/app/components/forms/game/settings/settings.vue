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
	<app-form :controller="form">
		<app-form-group
			v-if="!hasPackagesForSale"
			name="ads_enabled"
			:label="$gettext(`dash.games.settings.ads_label`)"
		>
			<app-form-control-toggle class="pull-right" />
			<div class="help-block">
				<p>
					<strong>
						<translate>Turning this off will remove all ads for this game.</translate>
					</strong>
				</p>
				<p>
					<translate>
						Only do this if you don't want your game monetized, or if your game is
						subject to a license that doesn't allow monetization.
					</translate>
				</p>
			</div>
		</app-form-group>
		<div v-else class="form-group">
			<label class="control-label">
				<translate>dash.games.settings.ads_label</translate>
			</label>
			<div class="alert">
				<translate v-if="hasPackagesForSale">
					We don't show ads on Marketplace game pages (even for pay what you want games).
				</translate>
			</div>
		</div>

		<app-form-group
			name="comments_enabled"
			:label="$gettext(`dash.games.settings.comments_label`)"
		>
			<app-form-control-toggle class="pull-right" />
			<div class="help-block">
				<p>
					<strong>
						<translate>
							Turning this off will disable comments for this game and hide any
							comments already on the page.
						</translate>
					</strong>
				</p>

				<p>
					<translate>
						The community will no longer be able to give you feedback via comments, but
						you may prefer this if your game contains sensitive or controversial
						material.
					</translate>
				</p>

				<p>
					<translate>
						This will never remove comments from your game page—merely hide them. If you
						allow comments again in the future, all previously hidden comments will be
						restored.
					</translate>
				</p>
			</div>
		</app-form-group>

		<app-form-group name="ratings_enabled" :label="$gettext('Allow ratings?')">
			<app-form-control-toggle class="pull-right" />

			<div class="help-block">
				<p>
					<strong>
						<translate>
							Turning this off will disable ratings for this game and hide any ratings
							already on the page.
						</translate>
					</strong>
				</p>
				<p>
					<translate>
						Your game's voltage will be calculated as if it had received no likes or
						dislikes. If you allow ratings in the future, the old ratings will be
						reapplied and your voltage will be recalculated.
					</translate>
				</p>
			</div>
		</app-form-group>

		<app-dash-game-wizard-controls>
			<app-form-button>
				<translate>dash.games.settings.save_button</translate>
			</app-form-button>
		</app-dash-game-wizard-controls>
	</app-form>
</template>
