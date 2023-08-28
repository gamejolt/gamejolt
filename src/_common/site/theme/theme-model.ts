import { Model } from '../../model/model.service';
import { SiteTemplateModel } from '../template/template-model';

export class SiteThemeModel extends Model {
	declare template: SiteTemplateModel;
	declare data: any;

	constructor(data: any = {}) {
		super(data);

		if (data.template) {
			this.template = new SiteTemplateModel(data.template);
		}

		if (data.data) {
			if (typeof data.data === 'string') {
				this.data = JSON.parse(data.data) || {};
			} else {
				this.data = data.data;
			}
		}
	}
}
