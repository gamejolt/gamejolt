import { Model } from '../../model/model.service';

export type FIRESIDE_ROLES = 'host' | 'cohost' | 'guest' | 'audience';

export class FiresideRoleModel extends Model {
	role!: FIRESIDE_ROLES;
	can_stream_audio?: boolean;
	can_stream_video?: boolean;

	get canStream() {
		return this.can_stream_audio || this.can_stream_video;
	}
}
