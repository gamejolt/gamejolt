import Monster, { lerp, LIFETIME } from './monster';

export class Witch extends Monster {
	leaving = false;
	entering = false;
	spawnSide = -1;

	get img() {
		return require('../../../../img/halloween/witch.png');
	}

	get invulnerable() {
		return this.leaving || this.entering;
	}

	getSpawnPoint() {
		return this.getTargetPoint(-1);
	}

	getDestination() {
		return this.getTargetPoint(this.spawnSide);
	}

	getTargetPoint(side: number) {
		const width = this.shell.containerWidth;
		const slice = width / 10;
		let x = 0;

		if (side === -1) {
			if (Math.random() < 0.5) {
				this.spawnSide = 0;
			} else {
				this.spawnSide = 1;
			}
		}

		if (this.spawnSide === 0) {
			// left
			x = Math.random() * slice + this.width / 2;
		} else {
			// right
			x = width - Math.random() * slice - this.width / 2;
		}

		return {
			x: x,
			y: this.getRandomPosition().y,
		};
	}

	interact() {
		if (this.health > 0 && !this.leaving && !this.entering) {
			this.interacted = true;
			this.lifetime = LIFETIME;
			this.health -= 0.2;
			this.destination = this.getDestination();
			this.clickAnimation();

			if (this.health <= 0.01) {
				this.health = 0;
				this.lifetime = 0;
				this.die();
			} else {
				if (Math.random() < 0.5 + 0.3 * this.level) {
					this.leaving = true;

					if (this.spawnSide === 0) {
						this.destination.x = -this.width * 2;
						this.spawnSide = 1;
					} else {
						this.destination.x = this.shell.containerWidth + this.width * 2;
						this.spawnSide = 0;
					}
					this.destination.y = this.pos.y;
				}
			}
		}
	}

	update() {
		this.grow();

		if (this.interacted && this.health > 0) {
			this.pos.x = lerp(this.destination.x, this.pos.x, 0.99 - 0.01 * this.level);
			this.pos.y = lerp(this.destination.y, this.pos.y, 0.99 - 0.01 * this.level);

			if (!this.leaving && !this.entering) {
				if (Math.abs(this.pos.x - this.destination.x) < 50 + 30 * this.level) {
					this.destination.x = this.getDestination().x;
				}
				if (Math.abs(this.pos.y - this.destination.y) < 50 + 30 * this.level) {
					this.destination.y = this.getDestination().y;
				}
			}

			if (this.leaving && Math.abs(this.pos.x - this.destination.x) < 100) {
				this.entering = true;
				this.leaving = false;
				this.lifetime = LIFETIME;
				if (this.spawnSide === 0) {
					this.pos.x = -this.width;
					this.destination.x = this.width * 2;
				} else {
					this.pos.x = this.shell.containerWidth;
					this.destination.x = this.shell.containerWidth - this.width * 2;
				}
			}

			if (this.entering && Math.abs(this.pos.x - this.destination.x) < 50) {
				this.entering = false;
			}
		}

		this.shake++;
		this.rot = Math.sin(this.shake / 20) * 10;
	}
}
