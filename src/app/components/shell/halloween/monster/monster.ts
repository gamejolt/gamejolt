import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { findRequiredVueParent } from '../../../../../utils/vue';
import { HalloweenMonster } from '../../../../../_common/halloween-monster/halloween-monster.model';
import AppShellHalloweenTS from '../halloween';
import AppShellHalloween from '../halloween.vue';
import Monster from '../monsters/monster';
import MonsterFactory from '../monsters/monster-factory';

@Component({})
export default class AppShellHalloweenMonster extends Vue {
	@Prop(Object)
	encounter!: HalloweenMonster;

	monster: Monster = null as any;
	private shell!: AppShellHalloweenTS;
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
		this.shell = findRequiredVueParent(this, AppShellHalloween) as AppShellHalloweenTS;
	}

	mounted() {
		this.monster = MonsterFactory.create(this.encounter, this.shell);
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
