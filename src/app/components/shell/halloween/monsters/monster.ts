import { HalloweenMonster } from '../../../../../_common/halloween-monster/halloween-monster.model';
import { User } from '../../../../../_common/user/user.model';
import AppShellHalloweenTS from '../halloween';
import { ShellHalloweenMonsterModal } from '../monster/modal/modal.service';

export const LIFETIME = 60 * 15;

export interface Position {
	x: number;
	y: number;
}

export function lerp(a: number, b: number, f: number) {
	return a + f * (b - a);
}

export default abstract class Monster {
	pos: Position;
	destination: Position;
	rot = 0;
	size = 0;
	opacity = 0;
	shake = 0;
	health = 1;
	interacted = false;
	lifetime = LIFETIME;

	private interval: NodeJS.Timer | null = null;
	private dedRequest: Promise<any> | null = null;

	get level() {
		return this.model.user_level / 100;
	}

	abstract get img(): string;
	abstract update(): void;
	abstract interact(): void;

	constructor(readonly model: HalloweenMonster, readonly shell: AppShellHalloweenTS) {
		this.pos = this.getSpawnPoint();
		this.destination = this.getDestination();

		this.interval = setInterval(() => {
			this.update();
		}, 16);
	}

	get invulnerable() {
		return false;
	}

	get width() {
		return 100;
	}

	get height() {
		return 100;
	}

	getRandomPosition(): Position {
		return {
			x:
				Math.floor(Math.random() * (this.shell.containerWidth - this.width * 2)) +
				this.width,
			y:
				Math.floor(Math.random() * (this.shell.containerHeight - this.height * 2)) +
				this.height,
		};
	}

	getSpawnPoint() {
		return this.getRandomPosition();
	}

	getDestination() {
		return this.getRandomPosition();
	}

	die() {
		if (!this.dedRequest) {
			this.dedRequest = this.model.$capture();
		}
	}

	async remove() {
		if (this.interval) {
			HalloweenMonster.remove(this.model);
			this.shell.endCombat();
			if (this.health <= 0) {
				try {
					const result = await this.dedRequest;
					const user: User = result.user;
					ShellHalloweenMonsterModal.show(
						this.img,
						user.halloween_2019_breakdown![this.model.type],
						result.breakdown[this.model.type],
						result.pun,
						result.mood + ' ' + this.model.type
					);
				} catch (err) {}
			}
			clearInterval(this.interval);
			this.interval = null;
		}
	}

	grow() {
		if (this.lifetime <= 0) {
			if (this.size > 0) {
				const growSpeed = 0.01;

				this.size -= growSpeed;
				this.opacity -= growSpeed;

				this.pos.x += (growSpeed / 2) * this.width;
				this.pos.y += (growSpeed / 2) * this.height;

				if (this.size <= 0) {
					this.remove();
				}
			}
		} else {
			if (this.size < 1) {
				const growSpeed = 0.005;

				this.size += growSpeed;
				this.opacity += growSpeed;

				this.pos.x -= (growSpeed / 2) * this.width;
				this.pos.y -= (growSpeed / 2) * this.height;

				if (this.size >= 1) {
					this.size = 1;
				}
			} else {
				if (this.lifetime > 0) {
					this.lifetime--;
				}
			}
		}
	}

	clickAnimation() {
		this.size = 0.75;
		this.pos.x += this.width * 0.125;
		this.pos.y += this.height * 0.125;
		this.opacity = 1;
	}
}
