import { Model } from '../../../model/model.service';

export class GameBuildFile extends Model {
	declare game_build_id: number;
	declare filename: string;
	declare filesize: string;
	declare java_include_archive: boolean;
	declare is_archive: boolean;
	declare is_archive_ready: boolean;
}
