import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../utils/vue';
import { PlayerController, togglePlayerControllerPlayback } from '../controller';

@Component({})
export default class AppPlayerPlayback extends Vue {
	@Prop(propRequired(PlayerController)) player!: PlayerController;

	get icon() {
		return this.player.shouldPlay ? 'pause' : 'play';
	}

	onClickPlayback() {
		togglePlayerControllerPlayback(this.player);
	}
}
