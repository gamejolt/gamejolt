import Monster, { lerp, LIFETIME } from './monster';

export class Candy extends Monster {
	get img() {
		return require('../../../../img/halloween/candy.png');
	}

	interact() {
		if (this.health > 0) {
			this.interacted = true;
			this.lifetime = LIFETIME;
			this.health -= 0.2;
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
			// TODO(halloween) mouse move isnt detected for some reason
			if (
				this.shell.getMouseX() > this.pos.x - 100 &&
				this.shell.getMouseX() < this.pos.x + this.width + 200 &&
				this.shell.getMouseY() > this.pos.y - 100 &&
				this.shell.getMouseY() < this.pos.y + this.height + 200 &&
				Math.random() < 0.01 + 0.01 * this.level
			) {
				this.destination = this.getDestination();
			}

			this.pos.x = lerp(this.destination.x, this.pos.x, 0.97);
			this.pos.y = lerp(this.destination.y, this.pos.y, 0.97);
		}

		this.shake++;
		this.rot = Math.sin(this.shake / 10) * 10;
	}
}
