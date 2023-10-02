import { Model } from '../../model/model.service';

export class ThemePresetModel extends Model {
	declare name: string;
	declare highlight: string;
	declare backlight: string;
	declare notice: string;
	declare tint: string | null;
}
