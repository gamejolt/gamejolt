import { BroadcastChannel, createLeaderElection, LeaderElector } from 'broadcast-channel';

/**
 * Determines a leader between tabs.
 * Continues to poll until this tab can become leader.
 */
export class TabLeader {
	private readonly elector: LeaderElector;
	private readonly channel: BroadcastChannel;

	private isDead = false;

	get isLeader() {
		return this.elector.isLeader;
	}

	constructor(name: string) {
		this.channel = new BroadcastChannel(name);
		this.elector = createLeaderElection(this.channel);
	}

	/**
	 * This function begins the process of attemping to become the leader.
	 * All tabs need this process to be active.
	 */
	public init() {
		// Can only be used when not dead yet.
		if (this.isDead) {
			throw new Error('Tried using dead tab leader.');
		}

		// This promise will resolve if this tab ever becomes the leader.
		// It should fail if the tab loses leadership.
		// When that happens we want to try just to become leader again.
		this.elector.awaitLeadership().catch(() => this.init());
	}

	public async kill() {
		this.isDead = true;

		await this.channel.close();
		await this.elector.die();
	}
}
