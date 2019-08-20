import { Model } from '../../model/model.service';

export class SiteContentBlock extends Model {
	content_markdown!: string;
	content_compiled!: string;
}

Model.create(SiteContentBlock);
