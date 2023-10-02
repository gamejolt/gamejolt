import { Model } from '../../model/model.service';

export type FIRESIDE_ROLES = 'host' | 'cohost' | 'guest' | 'audience';

export class FiresideRoleModel extends Model {
	declare role: FIRESIDE_ROLES;
	declare can_stream_audio?: boolean;
	declare can_stream_video?: boolean;

	get canStream() {
		return this.can_stream_audio || this.can_stream_video;
	}
}
