import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { AppTrackEvent } from '../../../../../../_common/analytics/track-event.directive';
import { Screen } from '../../../../../../_common/screen/screen-service';
import { Store } from '../../../../../store/index';

@Component({
	components: {},
	directives: {
		AppTrackEvent,
	},
})
export default class AppDiscoverHomeBannerCustom extends Vue {
	@State
	app!: Store['app'];

	readonly Screen = Screen;

	get trackEventName() {
		return 'slamdance-dig';
	}

	get location() {
		return 'https://slamdance.com/dig/#submit ';
	}

	get backUrl() {
		return 'https://i.gjcdn.net/data/fireside/posts/6/244/414244/media/background-25rpac8s.jpg';
	}

	get frontUrl() {
		return 'https://i.gjcdn.net/data/fireside/posts/6/244/414244/media/logo-gi3xsnfi.png';
	}

	get featureContent() {
		return 'Submit your game to the Slamdance Digital, Interactive, and Gaming Showcase by August 31!';
	}

	get buttonText() {
		return 'Submit Game';
	}
}
