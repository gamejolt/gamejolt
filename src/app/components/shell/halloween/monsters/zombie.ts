import Monster, { LIFETIME } from './monster';

export class Zombie extends Monster {
	respawning = false;
	respawned = false;

	get img() {
		return require('../../../../img/halloween/zombie.png');
	}

	interact() {
		if (this.health > 0 && !this.respawning) {
			this.interacted = true;
			this.lifetime = LIFETIME;
			this.health -= 0.2 - 0.05 * this.level;
			this.destination = this.getDestination();
			this.clickAnimation();

			if (this.health <= 0.01) {
				this.health = 0;
				this.lifetime = 0;
				this.die();
			} else {
				if (Math.random() <= 0.3) {
					this.respawning = true;
				}
			}
		}
	}

	update() {
		this.grow();

		if (this.interacted && this.health > 0) {
			if (this.respawning) {
				if (this.respawned) {
					this.size += 0.02;
					this.pos.x -= (0.02 / 2) * this.width;
					if (this.size >= 1) {
						this.size = 1;
						this.respawned = false;
						this.respawning = false;
					}
				} else {
					this.size -= 0.02;
					this.pos.x += (0.02 / 2) * this.width;
					if (this.size <= 0) {
						this.size = 0;

						const respawnPoint = this.getDestination();
						this.pos.x = respawnPoint.x;
						this.pos.y = respawnPoint.y;
						this.respawned = true;
					}
				}
			} else {
				if (this.pos.x < this.destination.x) {
					this.pos.x += 1 + this.level * 2;
					if (this.pos.x >= this.destination.x) {
						this.pos.x = this.destination.x;
					}
				} else if (this.pos.x > this.destination.x) {
					this.pos.x -= 1 + this.level * 2;
					if (this.pos.x <= this.destination.x) {
						this.pos.x = this.destination.x;
					}
				}
				if (this.pos.y < this.destination.y) {
					this.pos.y += 1 + this.level * 2;
					if (this.pos.y >= this.destination.y) {
						this.pos.y = this.destination.y;
					}
				} else if (this.pos.y > this.destination.y) {
					this.pos.y -= 1 + this.level * 2;
					if (this.pos.y <= this.destination.y) {
						this.pos.y = this.destination.y;
					}
				}

				if (this.pos.x === this.destination.x && this.pos.y === this.destination.y) {
					this.destination = this.getDestination();
				}
			}
		}

		this.shake++;
		this.rot = Math.sin(this.shake / 20) * 10;
	}
}
