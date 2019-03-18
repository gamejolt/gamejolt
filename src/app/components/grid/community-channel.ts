import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import { Channel, Socket } from 'phoenix';

export class CommunityChannel extends Channel {
	community: Community;

	constructor(community: Community, socket: Socket, params?: object) {
		super('community:' + community.id, params, socket);
		(socket as any).channels.push(this);

		this.community = community;
	}
}
