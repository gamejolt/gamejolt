import { Model } from '../../model/model.service';

export class GameExternalPackage extends Model {
	static readonly STATUS_ACTIVE = 'active';
	static readonly STATUS_REMOVED = 'removed';

	game_id!: number;
	title!: string;
	description!: string;
	url!: string;
	added_on!: number;
	updated_on!: number;
	status!: string;

	os_windows?: boolean;
	os_windows_64?: boolean;
	os_mac?: boolean;
	os_mac_64?: boolean;
	os_linux?: boolean;
	os_linux_64?: boolean;
	os_other?: boolean;
	type_desktop?: boolean;
	type_html?: boolean;
	type_flash?: boolean;
	type_silverlight?: boolean;
	type_unity?: boolean;
	type_applet?: boolean;
	type_rom?: boolean;
}

Model.create(GameExternalPackage);
