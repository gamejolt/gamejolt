import Vue from 'vue';
import Component from 'vue-class-component';
import { State } from 'vuex-class';
import { number } from '../../../_common/filters/number';
import AppGameThumbnailImg from '../../../_common/game/thumbnail-img/thumbnail-img.vue';
import { Store } from '../../store/index';

@Component({
	components: {
		AppGameThumbnailImg,
	},
})
export default class AppGameCoverCredits extends Vue {
	@State coverGame: Store['coverGame'];

	readonly number = number;
}
