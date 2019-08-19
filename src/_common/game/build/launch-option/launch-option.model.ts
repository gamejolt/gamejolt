import { Model } from '../../../model/model.service';

export class GameBuildLaunchOption extends Model {
	static readonly OS_WINDOWS = 'windows';
	static readonly OS_WINDOWS_64 = 'windows_64';
	static readonly OS_MAC = 'mac';
	static readonly OS_MAC_64 = 'mac_64';
	static readonly OS_LINUX = 'linux';
	static readonly OS_LINUX_64 = 'linux_64';

	static readonly LAUNCHABLE_PLATFORMS = [
		GameBuildLaunchOption.OS_WINDOWS,
		GameBuildLaunchOption.OS_WINDOWS_64,
		GameBuildLaunchOption.OS_MAC,
		GameBuildLaunchOption.OS_MAC_64,
		GameBuildLaunchOption.OS_LINUX,
		GameBuildLaunchOption.OS_LINUX_64,
	];

	game_build_id!: number;
	os!: string;
	executable_path!: string;
}

Model.create(GameBuildLaunchOption);
