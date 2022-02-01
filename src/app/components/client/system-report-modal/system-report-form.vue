<script lang="ts">
import type { IClientOSInfo } from 'client-voodoo';
import { mixins, Options } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import { ClientLogger } from '../../../../_common/client/logger/logger.service';
import AppEmoji from '../../../../_common/emoji/AppEmoji.vue';
import { BaseForm, FormOnSubmit } from '../../../../_common/form-vue/form.service';
// import { ClientLibraryState, ClientLibraryStore } from '../../../store/client-library';
import { LocalDbGame } from '../local-db/game/game.model';
import { LocalDbPackage } from '../local-db/package/package.model';

interface FormModel {
	description: string;
	log_lines: string;
	os_info: IClientOSInfo;
	localdb_games: { [id: number]: LocalDbGame };
	localdb_packages: { [id: number]: LocalDbPackage };
}

class Wrapper extends BaseForm<FormModel> {}

@Options({
	components: {
		AppEmoji,
	},
})
export default class FormClientSystemReport extends mixins(Wrapper) implements FormOnSubmit {
	// @ClientLibraryState
	// games!: ClientLibraryStore['gamesById'];
	games!: any;

	// @ClientLibraryState
	// packages!: ClientLibraryStore['packagesById'];
	packages!: any;

	onSubmit() {
		const log = ClientLogger.getLogInfo();

		this.setField('log_lines', log.logLines.join('\n'));
		this.setField('os_info', log.osInfo);
		this.setField('localdb_games', this.games);
		this.setField('localdb_packages', this.packages);

		return Api.sendRequest('/web/client/logs/submit', this.formModel, {
			allowComplexData: ['os_info', 'localdb_games', 'localdb_packages'],
		});
	}
}
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup name="issue_tracker_url" optional :label="$gettext('Issue Tracker Link')">
			<p class="help-block">
				<AppTranslate>
					Paste the link to your ticket here. It's optional, but without it we can't get
					back to you if we need more info to solve it.
				</AppTranslate>
				<AppEmoji emoji="huh" />
			</p>

			<AppFormControl
				type="text"
				placeholder="https://github.com/gamejolt/issue-tracker/issues/1313"
				:validators="[
					validateMaxLength(255),
					validatePattern(
						/^(?:https?:\/\/)?github.com\/gamejolt\/issue-tracker\/issues\/\d+/
					),
				]"
			/>
			<AppFormControlErrors :label="$gettext('link')">
				<AppFormControlError
					when="pattern"
					:message="$gettext(`This doesn't look like a valid issue link.`)"
				/>
			</AppFormControlErrors>
		</AppFormGroup>

		<AppFormGroup
			name="description"
			:label="$gettext('Description')"
		>
			<p class="help-block">
				<AppTranslate>Describe what this system report is about, any bugs you may have encountered, and how you can reproduce.</AppTranslate>
			</p>
			<AppFormControlTextarea maxlength="1000" rows="5" />
			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormButton :disabled="!valid">
			<AppTranslate>Submit Bug Report</AppTranslate>
		</AppFormButton>
	</AppForm>
</template>
