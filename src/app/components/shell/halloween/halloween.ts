import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import View from '!view!./halloween.html?style=./halloween.styl';

import { AppShellHalloweenMonster } from './monster/monster';
import { HalloweenMonster } from '../../../../lib/gj-lib-client/components/halloween-monster/halloween-monster.model';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';

@View
@Component({
	components: {
		AppShellHalloweenMonster,
	},
})
export class AppShellHalloween extends Vue {
	$refs: {
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
