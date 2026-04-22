import { BroadcastChannel, createLeaderElection, LeaderElector } from 'broadcast-channel';
import { markRaw } from 'vue';

export interface TabLeaderConstructor {
	new (name: string): TabLeaderInterface;
}

export interface TabLeaderInterface {
	isLeader: boolean;
	init: () => void;
	kill: () => Promise<void>;
}

/**
 * Determines a leader between tabs using broadcast-channel.
 * Continues to poll until this tab can become leader.
 */
const BrowserTabLeader: TabLeaderConstructor = class BrowserTabLeader implements TabLeaderInterface {
	private readonly elector: LeaderElector;
	private readonly channel: BroadcastChannel;

	private isDead = false;

	get isLeader() {
		return this.elector.isLeader;
	}

	constructor(name: string) {
		this.channel = markRaw(new BroadcastChannel(name));
		this.elector = markRaw(createLeaderElection(this.channel));
	}

	/**
	 * This function begins the process of attemping to become the leader. All
	 * tabs need this process to be active.
	 */
	init() {
		// Can only be used when not dead yet.
		if (this.isDead) {
			throw new Error('Tried using dead tab leader.');
		}

		// This promise will resolve if this tab ever becomes the leader.
		// It should fail if the tab loses leadership.
		// When that happens we want to try just to become leader again.
		this.elector.awaitLeadership().catch(() => this.init());
	}

	async kill() {
		this.isDead = true;

		await this.channel.close();
		await this.elector.die();
	}
};

const ClientTabLeader: TabLeaderConstructor = class ClientTabLeader implements TabLeaderInterface {
	readonly isLeader = true;

	constructor(_name: string) {}

	init() {}
	async kill() {}
};

export const TabLeader = GJ_IS_DESKTOP_APP ? ClientTabLeader : BrowserTabLeader;
