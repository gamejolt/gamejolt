import { shallowReadonly } from 'vue';
import { createLogger } from '../../../utils/logging';
import { chooseFocusedRTCUser } from '../../../_common/fireside/rtc/rtc';
import {
	createSocketChannelController,
	SocketChannelController,
} from '../../../_common/socket/socket-controller';
import { User } from '../../../_common/user/user.model';
import { FiresideController } from '../fireside/controller/controller';
import { GridClient } from './client.service';

export type GridFiresideDMChannel = Readonly<{
	channelController: SocketChannelController;
	firesideHash: string;
	joinPromise: Promise<void>;
}>;

interface ListableHostsPayload {
	listable_host_ids?: number[];
}

export function createGridFiresideDMChannel(
	client: GridClient,
	firesideController: FiresideController,
	options: { firesideHash: string; user: User }
): GridFiresideDMChannel {
	const { socketController } = client;
	const { firesideHash, user } = options;

	const logger = createLogger('Fireside');

	const channelController = createSocketChannelController(
		`fireside-dm:${firesideHash}:${user.id}`,
		socketController
	);

	channelController.listenTo('update', _onListableHosts);

	const joinPromise = channelController.join();

	const c = shallowReadonly({
		channelController,
		firesideHash,
		joinPromise,
	});

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
