import View from '!view!./system-report-form.html';
import { IClientOSInfo } from 'client-voodoo';
import { Component } from 'vue-property-decorator';

import { ClientLogger } from '../../../../_common/client/logger/logger.service';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import {
	BaseForm,
	FormOnSubmit,
} from '../../../../lib/gj-lib-client/components/form-vue/form.service';

interface FormModel {
	description: string;
	log_lines: string;
	os_info: IClientOSInfo;
}

@View
@Component({})
export class FormClientSystemReport extends BaseForm<FormModel> implements FormOnSubmit {
	onSubmit() {
		const log = ClientLogger.getLogInfo();

		this.setField('log_lines', log.logLines.join('\n'));
		this.setField('os_info', log.osInfo);

		return Api.sendRequest('/web/client/logs/submit', this.formModel, {
			allowComplexData: ['os_info'],
		});
	}
}
