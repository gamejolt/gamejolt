import Monster, { lerp, LIFETIME } from './monster';

export default class Pumpkin extends Monster {
	get img() {
		return require('../../../../img/halloween/pumpkin.png');
	}

	interact() {
		if (this.health > 0) {
			this.interacted = true;
			this.lifetime = LIFETIME;
			this.health -= 0.2 - 0.1 * this.level;
			this.destination = this.getDestination();
			this.clickAnimation();

			if (this.health <= 0.01) {
				this.health = 0;
				this.lifetime = 0;
				this.die();
			}
		}
	}

	update() {
		this.grow();
		if (this.interacted && this.health > 0) {
			this.pos.x = lerp(this.destination.x, this.pos.x, 0.99 - 0.01 * this.level);
			this.pos.y = lerp(this.destination.y, this.pos.y, 0.99 - 0.01 * this.level);
			if (Math.abs(this.pos.x - this.destination.x) < 50 + 30 * this.level) {
				this.destination.x = this.getDestination().x;
			}
			if (Math.abs(this.pos.y - this.destination.y) < 50 + 30 * this.level) {
				this.destination.y = this.getDestination().y;
			}
		}

		this.shake++;
		this.rot = Math.sin(this.shake / 10) * 10;
	}
}
