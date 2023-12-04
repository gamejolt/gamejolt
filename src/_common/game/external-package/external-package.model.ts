import { Model } from '../../model/model.service';

export const enum GameExternalPackageStatus {
	Active = 'active',
	Removed = 'removed',
}

export class GameExternalPackageModel extends Model {
	declare game_id: number;
	declare title: string;
	declare description: string;
	declare url: string;
	declare added_on: number;
	declare updated_on: number;
	declare status: GameExternalPackageStatus;
	declare os_windows?: boolean;
	declare os_windows_64?: boolean;
	declare os_mac?: boolean;
	declare os_mac_64?: boolean;
	declare os_linux?: boolean;
	declare os_linux_64?: boolean;
	declare os_other?: boolean;
	declare type_desktop?: boolean;
	declare type_html?: boolean;
	declare type_flash?: boolean;
	declare type_silverlight?: boolean;
	declare type_unity?: boolean;
	declare type_applet?: boolean;
	declare type_rom?: boolean;
}
