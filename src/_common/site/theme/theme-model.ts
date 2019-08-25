import { Model } from '../../model/model.service';
import { SiteTemplate } from '../template/template-model';

export class SiteTheme extends Model {
	template!: SiteTemplate;
	data: any;

	constructor(data: any = {}) {
		super(data);

		if (data.template) {
			this.template = new SiteTemplate(data.template);
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

Model.create(SiteTheme);
