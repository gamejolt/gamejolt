import { Model } from '../../model/model.service';

export class ThemePreset extends Model {
	name!: string;
	highlight!: string;
	backlight!: string;
	notice!: string;
	tint!: string | null;
}
