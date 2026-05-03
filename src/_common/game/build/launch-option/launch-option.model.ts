import { Model } from '~common/model/model.service';

export const GameBuildLaunchOptionOsWindows = 'windows';
export const GameBuildLaunchOptionOsWindows64 = 'windows_64';
export const GameBuildLaunchOptionOsMac = 'mac';
export const GameBuildLaunchOptionOsMac64 = 'mac_64';
export const GameBuildLaunchOptionOsLinux = 'linux';
export const GameBuildLaunchOptionOsLinux64 = 'linux_64';

export type GameBuildLaunchOptionOs =
	| typeof GameBuildLaunchOptionOsWindows
	| typeof GameBuildLaunchOptionOsWindows64
	| typeof GameBuildLaunchOptionOsMac
	| typeof GameBuildLaunchOptionOsMac64
	| typeof GameBuildLaunchOptionOsLinux
	| typeof GameBuildLaunchOptionOsLinux64;

export const GameBuildLaunchablePlatforms = [
	GameBuildLaunchOptionOsWindows,
	GameBuildLaunchOptionOsWindows64,
	GameBuildLaunchOptionOsMac,
	GameBuildLaunchOptionOsMac64,
	GameBuildLaunchOptionOsLinux,
	GameBuildLaunchOptionOsLinux64,
];

export class GameBuildLaunchOptionModel extends Model {
	declare game_build_id: number;
	declare os: GameBuildLaunchOptionOs;
	declare executable_path: string;
}
