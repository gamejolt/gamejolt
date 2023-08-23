import { Model } from '../../model/model.service';

export class SiteContentBlock extends Model {
	declare content_markdown: string;
	declare content_compiled: string;
}
