<script lang="ts" setup>
import { computed, ref, toRef } from 'vue';

import AppForm, { createForm, FormController } from '../../../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../../../_common/form-vue/AppFormButton.vue';
import AppFormGroup from '../../../../../_common/form-vue/AppFormGroup.vue';
import AppFormControlToggle from '../../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import { $saveGameSettings, GameModel } from '../../../../../_common/game/game.model';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';
import AppDashGameWizardControls from '../wizard-controls/AppDashGameWizardControls.vue';

type Props = {
	model?: GameModel;
};

const props = defineProps<Props>();

const hasPackagesForSale = ref(false);

const form: FormController<GameModel> = createForm({
	model: toRef(props, 'model'),
	modelClass: GameModel,
	modelSaveHandler: $saveGameSettings,
	loadUrl: computed(() => `/web/dash/developer/games/settings/save/${props.model!.id}`),
	onLoad(payload: any) {
		hasPackagesForSale.value = payload.hasPackagesForSale;
	},
});
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
