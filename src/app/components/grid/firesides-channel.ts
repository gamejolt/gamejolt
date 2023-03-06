import { shallowReadonly } from 'vue';
import { createLogger } from '../../../utils/logging';
import { createSocketChannelController } from '../../../_common/socket/socket-controller';
import { GridClient } from './client.service';

export type GridFiresidesChannel = ReturnType<typeof createGridFiresidesChannel>;

interface FiresideExpiredPayload {
	fireside_hash: string;
}

export function createGridFiresidesChannel(client: GridClient) {
	const { socketController, appStore } = client;

	const logger = createLogger('Fireside');

	const channelController = createSocketChannelController('firesides', socketController);

	channelController.listenTo('expired', _onFiresideExpired);

	const joinPromise = channelController.join({
		async onJoin() {},
	});

	const c = shallowReadonly({
		channelController,
		joinPromise,
	});

	function _onFiresideExpired(payload: FiresideExpiredPayload) {
		logger.info('Fireside expired.', payload);
		appStore.removeFireside(payload.fireside_hash);
	}

	return c;
}
