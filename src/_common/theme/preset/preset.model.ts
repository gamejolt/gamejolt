import { Model } from '../../model/model.service';

export class ThemePresetModel extends Model {
	name!: string;
	highlight!: string;
	backlight!: string;
	notice!: string;
	tint!: string | null;
}
