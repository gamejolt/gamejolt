import { markRaw, shallowReadonly } from 'vue';
import { chooseFocusedRTCUser } from '../../../_common/fireside/rtc/rtc';
import {
	SocketChannelController,
	createSocketChannelController,
} from '../../../_common/socket/socket-controller';
import { UserModel } from '../../../_common/user/user.model';
import { arrayRemove } from '../../../utils/array';
import { createLogger } from '../../../utils/logging';
import { FiresideController } from '../fireside/controller/controller';
import { GridClient } from './client.service';

export type GridFiresideDMChannel = Readonly<{
	channelController: SocketChannelController;
	firesideHash: string;
	joinPromise: Promise<void>;
	leave: () => void;
}>;

interface ListableHostsPayload {
	listable_host_ids?: number[];
}

export function createGridFiresideDMChannel(
	client: GridClient,
	firesideController: FiresideController,
	options: { firesideHash: string; user: UserModel }
): GridFiresideDMChannel {
	const { socketController } = client;
	const { firesideHash, user } = options;

	const logger = createLogger('Fireside');

	const channelController = createSocketChannelController(
		`fireside-dm:${firesideHash}:${user.id}`,
		socketController
	);

	channelController.listenTo('update', _onListableHosts);

	const joinPromise = channelController.join({
		async onJoin() {
			client.firesideDMChannels.push(markRaw(c));
		},
		onLeave() {
			arrayRemove(client.firesideDMChannels, i => i.firesideHash === firesideHash);
		},
	});

	const c = shallowReadonly({
		channelController,
		firesideHash,
		joinPromise,

		leave,
	});

	function leave() {
		channelController.leave();
	}

	async function _onListableHosts(payload: ListableHostsPayload) {
		logger.info('Grid listable hosts.', payload);
		const { listableHostIds, rtc } = firesideController;

		listableHostIds.value = new Set(payload.listable_host_ids ?? []);

		if (rtc.value) {
			chooseFocusedRTCUser(rtc.value);
		}
	}

	return c;
}
