import { BroadcastChannel, createLeaderElection, LeaderElector } from 'broadcast-channel';

/**
 * Determines a leader between tabs.
 * Continues to poll until this tab can become leader.
 */
export class TabLeader {
	private readonly _elector: LeaderElector;
	private readonly _channel: BroadcastChannel;

	private _isDead = false;

	get isLeader() {
		return this._elector.isLeader;
	}

	constructor(name: string) {
		this._channel = new BroadcastChannel(name);
		this._elector = createLeaderElection(this._channel);
	}

	/**
	 * This function begins the process of attemping to become the leader.
	 * All tabs need this process to be active.
	 */
	public init() {
		// Can only be used when not dead yet.
		if (this._isDead) {
			throw new Error('Tried using dead tab leader.');
		}

		// This promise will resolve if this tab ever becomes the leader.
		// It should fail if the tab loses leadership.
		// When that happens we want to try just to become leader again.
		this._elector.awaitLeadership().catch(() => this.init());
	}

	public async kill() {
		this._isDead = true;

		await this._channel.close();
		await this._elector.die();
	}
}
