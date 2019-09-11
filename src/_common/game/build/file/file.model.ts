import { Model } from '../../../model/model.service';

export class GameBuildFile extends Model {
	game_build_id!: number;
	filename!: string;
	filesize!: string;
	java_include_archive!: boolean;
	is_archive!: boolean;
	is_archive_ready!: boolean;
}

Model.create(GameBuildFile);
