<script lang="ts">
import { IClientOSInfo } from 'client-voodoo';
import { mixins, Options } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import { ClientLogger } from '../../../../_common/client/logger/logger.service';
import AppEmoji from '../../../../_common/emoji/AppEmoji.vue';
import { BaseForm, FormOnSubmit } from '../../../../_common/form-vue/form.service';
import { ClientLibraryState, ClientLibraryStore } from '../../../store/client-library';
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
	@ClientLibraryState
	games!: ClientLibraryStore['gamesById'];

	@ClientLibraryState
	packages!: ClientLibraryStore['packagesById'];

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
	<app-form :controller="form">
		<app-form-group name="issue_tracker_url" optional :label="$gettext('Issue Tracker Link')">
			<p class="help-block">
				<translate>
					Paste the link to your ticket here. It's optional, but without it we can't get
					back to you if we need more info to solve it.
				</translate>
				<AppEmoji emoji="huh" />
			</p>

			<app-form-control
				type="text"
				placeholder="https://github.com/gamejolt/issue-tracker/issues/1313"
				:validators="[
					validateMaxLength(255),
					validatePattern(
						/^(?:https?:\/\/)?github.com\/gamejolt\/issue-tracker\/issues\/\d+/
					),
				]"
			/>
			<app-form-control-errors :label="$gettext('link')">
				<app-form-control-error
					when="pattern"
					:message="$gettext(`This doesn't look like a valid issue link.`)"
				/>
			</app-form-control-errors>
		</app-form-group>

		<app-form-group
			name="description"
			:label="$gettext('system_report.form.description_label')"
		>
			<p class="help-block">
				<translate>system_report.form.description_help</translate>
			</p>
			<app-form-control-textarea maxlength="1000" rows="5" />
			<app-form-control-errors />
		</app-form-group>

		<app-form-button :disabled="!valid">
			<translate>system_report.form.submit_button</translate>
		</app-form-button>
	</app-form>
</template>
