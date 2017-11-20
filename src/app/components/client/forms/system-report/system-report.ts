import { Component } from 'vue-property-decorator';
import View from '!view!./system-report.html';
import { ClientLogger } from '../../logger/logger.service';
import {
	BaseForm,
	FormOnSubmit,
} from '../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { IClientOSInfo } from 'client-voodoo';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';

interface FormModel {
	description: string;
	log_lines: string;
	os_info: IClientOSInfo;
}

@View
@Component({})
export class FormClientSystemReport extends BaseForm<FormModel> implements FormOnSubmit {
	onSubmit(): Promise<any> {
		const log = ClientLogger.getLogInfo();

		this.setField('log_lines', log.logLines.join('\n'));
		this.setField('os_info', log.osInfo);

		return Api.sendRequest('/web/client/logs/submit', this.formModel, {
			allowComplexData: ['os_info'],
		});
	}
}
