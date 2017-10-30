import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./monster.html?style=./monster.styl';
import { AppShellHalloween } from '../halloween';
import { findRequiredVueParent } from '../../../../../lib/gj-lib-client/utils/vue';
import { HalloweenMonster } from '../../../../../lib/gj-lib-client/components/halloween-monster/halloween-monster.model';
import { ShellHalloweenMonsterModal } from './modal/modal.service';
import { User } from '../../../../../lib/gj-lib-client/components/user/user.model';

@View
@Component({})
export class AppShellHalloweenMonster extends Vue {
	@Prop(Object) encounter: HalloweenMonster;

	monster: Monster = null as any;
	private shell: AppShellHalloween;
	private beforeEachDeregister?: Function;

	get monsterTransform() {
		let imgTransform = 'rotate(' + this.monster.rot + 'deg)';
		if (this.monster.pos.x > this.monster.destination.x) {
			imgTransform += ' scaleX(-1)';
		}
		return imgTransform;
	}

	get healthbarVisibility() {
		return this.monster.health < 1 && this.monster.health > 0 && !this.monster.invulnerable
			? 'visible'
			: 'hidden';
	}

	created() {
		this.shell = findRequiredVueParent(this, AppShellHalloween);
	}

	mounted() {
		this.monster = Monster.create(this.encounter, this.shell);
		this.beforeEachDeregister = this.$router.beforeEach((_to, _from, next) => {
			this.remove();
			next();
		});
	}

	destroyed() {
		if (this.beforeEachDeregister) {
			this.beforeEachDeregister();
			this.beforeEachDeregister = undefined;
		}
	}

	remove() {
		if (this.monster) {
			this.monster.remove();
			this.monster = null as any;
		}
	}

	interact() {
		this.shell.startCombat();
		this.monster.interact();
	}
}

const LIFETIME = 60 * 15;
export interface Position {
	x: number;
	y: number;
}

function lerp(a: number, b: number, f: number) {
	return a + f * (b - a);
}

export abstract class Monster {
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

	static create(monster: HalloweenMonster, shell: AppShellHalloween) {
		switch (monster.type) {
			case 'pumpkin':
				return new Pumpkin(monster, shell);
			case 'zombie':
				return new Zombie(monster, shell);
			case 'witch':
				return new Witch(monster, shell);
			case 'candy':
				return new Candy(monster, shell);
			case 'vampire':
				return new Vampire(monster, shell);
		}
	}

	constructor(readonly model: HalloweenMonster, readonly shell: AppShellHalloween) {
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
			x: Math.floor(Math.random() * (this.shell.containerWidth - this.width * 2)) + this.width,
			y: Math.floor(Math.random() * (this.shell.containerHeight - this.height * 2)) + this.height,
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
					// return PayloadHelper::output([
					// 	'success' => true,
					// 	'user' => $user,
					// 	'breakdown' => $this->_breakdown(),
					// 	'pun' => $puns[rand(0, count($puns) - 1)],
					// 	'mood' => HalloweenMonster::MOODS[rand(0, count(HalloweenMonster::MOODS) - 1)],
					// ]);
					ShellHalloweenMonsterModal.show(
						this.img,
						user.halloween_2017_breakdown![this.model.type],
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

				this.pos.x += growSpeed / 2 * this.width;
				this.pos.y += growSpeed / 2 * this.height;

				if (this.size <= 0) {
					this.remove();
				}
			}
		} else {
			if (this.size < 1) {
				const growSpeed = 0.005;

				this.size += growSpeed;
				this.opacity += growSpeed;

				this.pos.x -= growSpeed / 2 * this.width;
				this.pos.y -= growSpeed / 2 * this.height;

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

class Pumpkin extends Monster {
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

class Zombie extends Monster {
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
					this.pos.x -= 0.02 / 2 * this.width;
					if (this.size >= 1) {
						this.size = 1;
						this.respawned = false;
						this.respawning = false;
					}
				} else {
					this.size -= 0.02;
					this.pos.x += 0.02 / 2 * this.width;
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

class Witch extends Monster {
	leaving = false;
	entering = false;
	spawnSide = 0;

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
			this.clickAnimation();

			if (this.health <= 0.01) {
				this.health = 0;
				this.lifetime = 0;
				this.die();
			} else {
				if (Math.random() < 0.5 + 0.3 * this.level) {
					this.leaving = true;

					// TODO(halloween) make the witch leave and teleport to the other side instead of spawning another monster div
					// var w = new Witch(this.monstertype);
					// if (this.spawnSide == 0) {
					// 	this.destination.x = -this.getWidth() * 2;
					// 	w.spawnSide = 1;
					// 	w.x = document.getElementById('monster-container').offsetWidth + this.getWidth() * 2;
					// } else {
					// 	this.destination.x =
					// 		document.getElementById('monster-container').offsetWidth + this.getWidth() * 2;
					// 	w.spawnSide = 0;
					// 	w.x = -this.getWidth() * 2;
					// }
					// w.destination.x = w.getDestination().x;

					// w.y = this.pos.y;
					// this.destination.y = this.pos.y;
					// w.destination.y = this.pos.y;
					// w.size = 1;
					// w.opacity = 1;
					// w.interacted = true;
					// w.health = this.health;
					// w.entering = true;
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

			if (this.entering && Math.abs(this.pos.x - this.destination.x) < 50) {
				this.entering = false;
			}
		}

		this.shake++;
		this.rot = Math.sin(this.shake / 20) * 10;
	}
}

class Candy extends Monster {
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
				this.shell.mouseX > this.pos.x - 100 &&
				this.shell.mouseX < this.pos.x + this.width + 200 &&
				this.shell.mouseY > this.pos.y - 100 &&
				this.shell.mouseY < this.pos.y + this.height + 200 &&
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

class Vampire extends Monster {
	get img() {
		return require('../../../../img/halloween/vampire.png');
	}

	interact() {
		if (this.health > 0) {
			this.interacted = true;
			this.lifetime = LIFETIME;
			this.health -= 0.1 - 0.05 * this.level;
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
