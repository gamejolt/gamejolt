import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { makeObservableService } from '../../../../utils/vue';
import { HalloweenMonster } from '../../../../_common/halloween-monster/halloween-monster.model';
import AppShellHalloweenMonster from './monster/monster.vue';

@Component({
	components: {
		AppShellHalloweenMonster,
	},
})
export default class AppShellHalloween extends Vue {
	$refs!: {
		container: HTMLDivElement;
	};

	isInCombat = false;
	private _mouseX = -1;
	private _mouseY = -1;

	readonly HalloweenMonster = makeObservableService(HalloweenMonster);

	get containerWidth() {
		return this.$refs.container.offsetWidth;
	}

	get containerHeight() {
		return this.$refs.container.offsetHeight;
	}

	// getters don't work
	getMouseX() {
		return this._mouseX;
	}

	// getters don't work
	getMouseY() {
		return this._mouseY;
	}

	mouseMove(e: MouseEvent) {
		this._mouseX = e.clientX;
		this._mouseY = e.clientY;
	}

	startCombat() {
		this.isInCombat = true;
	}

	endCombat() {
		this.isInCombat = false;
	}
}
