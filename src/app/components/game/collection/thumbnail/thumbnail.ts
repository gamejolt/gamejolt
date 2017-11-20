import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./thumbnail.html?style=./thumbnail.styl';

import { GameCollection } from '../collection.model';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppImgResponsive } from '../../../../../lib/gj-lib-client/components/img/responsive/responsive';

@View
@Component({
	components: {
		AppJolticon,
		AppImgResponsive,
	},
})
export class AppGameCollectionThumbnail extends Vue {
	@Prop(GameCollection) collection: GameCollection;
	@Prop(Boolean) hideTag?: boolean;
}
