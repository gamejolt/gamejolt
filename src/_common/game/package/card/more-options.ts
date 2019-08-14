import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { AppTrackEvent } from '../../../analytics/track-event.directive';
import { filesize } from '../../../filters/filesize';
import { GameBuild } from '../../build/build.model';
import { GamePackageCardModel } from './card.model';

@Component({
	directives: {
		AppTrackEvent,
	},
	filters: {
		filesize,
	},
})
export default class AppGamePackageCardMoreOptions extends Vue {
	@Prop(GamePackageCardModel) card!: GamePackageCardModel;

	emulatorInfo = GameBuild.emulatorInfo;

	click(build: GameBuild) {
		this.$emit('click', build);
	}
}
