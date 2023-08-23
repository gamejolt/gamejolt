import { Model } from '../../../model/model.service';

export const enum GameBuildLaunchOptionOs {
	Windows = 'windows',
	Windows64 = 'windows_64',
	Mac = 'mac',
	Mac64 = 'mac_64',
	Linux = 'linux',
	Linux64 = 'linux_64',
}

export const GameBuildLaunchablePlatforms = [
	GameBuildLaunchOptionOs.Windows,
	GameBuildLaunchOptionOs.Windows64,
	GameBuildLaunchOptionOs.Mac,
	GameBuildLaunchOptionOs.Mac64,
	GameBuildLaunchOptionOs.Linux,
	GameBuildLaunchOptionOs.Linux64,
];

export class GameBuildLaunchOption extends Model {
	declare game_build_id: number;
	declare os: GameBuildLaunchOptionOs;
	declare executable_path: string;
}
