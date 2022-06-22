import { shallowReadonly } from 'vue';
import { chooseFocusedRTCUser } from '../../../_common/fireside/rtc/rtc';
import {
	createSocketChannelController,
	SocketChannelController,
} from '../../../_common/socket/socket-channel-controller';
import { User } from '../../../_common/user/user.model';
import { FiresideController } from '../fireside/controller/controller';
import { GridClient } from './client.service';

export type GridFiresideDMChannel = Readonly<{
	channelController: SocketChannelController;
	firesideHash: string;
}>;

interface ListableHostsPayload {
	listable_host_ids?: number[];
}

export async function createGridFiresideDMChannel(
	client: GridClient,
	firesideController: FiresideController,
	options: { firesideHash: string; user: User }
): Promise<GridFiresideDMChannel> {
	const { socketController } = client;
	const { firesideHash, user } = options;

	const channelController = createSocketChannelController(
		`fireside-dm:${firesideHash}:${user.id}`,
		socketController
	);

	channelController.listenTo('update', _onListableHosts);

	const c = shallowReadonly({
		channelController,
		firesideHash,
	});

	await channelController.join();

	async function _onListableHosts(payload: ListableHostsPayload) {
		console.debug('[FIRESIDE] Grid listable hosts.', payload);
		const { listableHostIds, rtc } = firesideController;

		listableHostIds.value = payload.listable_host_ids ?? [];

		if (rtc.value) {
			chooseFocusedRTCUser(rtc.value);
		}
	}

	return c;
}
