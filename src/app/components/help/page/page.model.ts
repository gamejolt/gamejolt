import { Environment } from '../../../../_common/environment/environment.service';
import { Model } from '../../../../_common/model/model.service';
import HelpCategory from '../category/category.model';

export default class HelpPage extends Model {
	declare title: string;
	declare url: string;
	declare tags: string;
	declare sort: number;
	declare updated_on: number;
	declare help_category: HelpCategory;
	declare content: string;
	declare subline_content: string;

	constructor(data: Partial<HelpPage> = {}) {
		super(data);

		if (data.help_category) {
			this.help_category = new HelpCategory(data.help_category);
		}
	}

	getShareUrl() {
		return (
			Environment.baseUrl +
			`/help-docs/${this.help_category.url}/${this.url}?utm_source=share`
		);
	}
}
