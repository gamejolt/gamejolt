<script lang="ts" setup>
import type { IClientOSInfo } from 'client-voodoo';

import { LocalDbGame } from '~app/components/client/local-db/game/game.model';
import { LocalDbPackage } from '~app/components/client/local-db/package/package.model';
import { useClientLibraryStore } from '~app/store/client-library/index';
import { Api } from '~common/api/api.service';
import { ClientLogger } from '~common/client/logger/logger.service';
import AppForm, { createForm, FormController } from '~common/form-vue/AppForm.vue';
import AppFormButton from '~common/form-vue/AppFormButton.vue';
import AppFormControlErrors from '~common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '~common/form-vue/AppFormGroup.vue';
import AppFormControlTextarea from '~common/form-vue/controls/AppFormControlTextarea.vue';
import AppTranslate from '~common/translate/AppTranslate.vue';

type FormModel = {
	description: string;
	log_lines: string;
	os_info: IClientOSInfo;
	localdb_games: { [id: number]: LocalDbGame };
	localdb_packages: { [id: number]: LocalDbPackage };
};

const emit = defineEmits<{
	submit: [];
}>();

const { games, packages } = useClientLibraryStore();

const form: FormController<FormModel> = createForm<FormModel>({
	onSubmit() {
		const log = ClientLogger.getLogInfo();

		form.formModel.log_lines = log.logLines.join('\n');
		form.formModel.os_info = log.osInfo;
		form.formModel.localdb_games = games.value;
		form.formModel.localdb_packages = packages.value;

		return Api.sendRequest('/web/client/logs/submit', form.formModel, {
			allowComplexData: ['os_info', 'localdb_games', 'localdb_packages'],
		});
	},
	onSubmitSuccess() {
		emit('submit');
	},
});
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup name="description" :label="$gettext('Description')">
			<p class="help-block">
				<AppTranslate>
					Describe what this system report is about, any bugs you may have encountered,
					and how you can reproduce.
				</AppTranslate>
			</p>
			<AppFormControlTextarea maxlength="1000" rows="5" />
			<AppFormControlErrors />
		</AppFormGroup>

		<div style="display: flex; justify-content: flex-end">
			<AppFormButton :disabled="!form.valid">
				<AppTranslate>Send</AppTranslate>
			</AppFormButton>
		</div>
	</AppForm>
</template>
