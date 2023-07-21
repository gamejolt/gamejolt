import { Model, defineLegacyModel } from '../../model/model.service';

export class SiteContentBlock extends defineLegacyModel(
	class SiteContentBlockDefinition extends Model {
		declare content_markdown: string;
		declare content_compiled: string;
	}
) {}
