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
