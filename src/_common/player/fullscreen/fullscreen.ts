import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../utils/vue';
import { PlayerController, togglePlayerControllerFullscreen } from '../controller';

@Component({})
export default class AppPlayerFullscreen extends Vue {
	@Prop(propRequired(PlayerController)) player!: PlayerController;

	toggleFullscreen() {
		togglePlayerControllerFullscreen(this.player);
	}
}
