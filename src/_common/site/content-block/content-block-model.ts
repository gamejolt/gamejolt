import { Model } from '../../model/model.service';

export class SiteContentBlockModel extends Model {
	declare content_markdown: string;
	declare content_compiled: string;
}
