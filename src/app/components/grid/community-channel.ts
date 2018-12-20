import { Channel, Socket } from 'phoenix';
import { Community } from '../../../lib/gj-lib-client/components/community/community.model';

export class CommunityChannel extends Channel {
	community: Community;

	constructor(community: Community, socket: Socket, params?: object) {
		super('community:' + community.id, params, socket);
		(socket as any).channels.push(this);

		this.community = community;
	}
}
