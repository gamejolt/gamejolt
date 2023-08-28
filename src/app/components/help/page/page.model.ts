import { Environment } from '../../../../_common/environment/environment.service';
import { Model } from '../../../../_common/model/model.service';
import { HelpCategoryModel } from '../category/category.model';

export class HelpPageModel extends Model {
	declare title: string;
	declare url: string;
	declare tags: string;
	declare sort: number;
	declare updated_on: number;
	declare help_category: HelpCategoryModel;
	declare content: string;
	declare subline_content: string;

	constructor(data: Partial<HelpPageModel> = {}) {
		super(data);

		if (data.help_category) {
			this.help_category = new HelpCategoryModel(data.help_category);
		}
	}

	getShareUrl() {
		return (
			Environment.baseUrl +
			`/help-docs/${this.help_category.url}/${this.url}?utm_source=share`
		);
	}
}
