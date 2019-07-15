import { IClientOSInfo } from 'client-voodoo';
import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { BaseForm, FormOnSubmit } from 'game-jolt-frontend-lib/components/form-vue/form.service';
import { Component } from 'vue-property-decorator';
import { ClientLogger } from '../../../../_common/client/logger/logger.service';
import { ClientLibraryStore, ClientLibraryState } from '../../../store/client-library';

interface FormModel {
	description: string;
	log_lines: string;
	os_info: IClientOSInfo;
}

@Component({})
export default class FormClientSystemReport extends BaseForm<FormModel> implements FormOnSubmit {
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
