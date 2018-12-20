import View from '!view!./slider.html?style=./slider.styl';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Store } from '../../../store';
import { AppCommunitySliderItem } from './item/item';

@View
@Component({
	components: {
		AppCommunitySliderItem,
	},
})
export class AppCommunitySlider extends Vue {
	@State
	communities!: Store['communities'];
}
