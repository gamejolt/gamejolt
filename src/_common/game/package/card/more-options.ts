import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { filesize } from '../../../../vue/filters/filesize';
import { AppTrackEvent } from '../../../analytics/track-event.directive';
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
