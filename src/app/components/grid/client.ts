import { Channel, Socket } from 'phoenix';
import { TabLeader } from '../../../utils/tab-leader';
import { uuidv4 } from '../../../utils/uuid';

export class GridClient {
	// Stores a unique id that identifies this session when it pushes data to Grid.
	readonly clientId = uuidv4();

	isConnected = false;
	socket: Socket | null = null;
	channels: Channel[] = [];

	tabLeader: TabLeader | null = null;
}

export function connect(client: GridClient) {}
