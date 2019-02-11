import View from '!view!./featured.html?style=./featured.styl';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { FeaturedItem } from '../../../../app/components/featured-item/featured-item.model';
import { AppGameFollowWidget } from '../../../../app/components/game/follow-widget/follow-widget';
import { AppGameThumbnailImg } from '../../../../lib/gj-lib-client/components/game/thumbnail-img/thumbnail-img';

@View
@Component({
	components: {
		AppGameThumbnailImg,
		AppGameFollowWidget,
	},
})
export default class AppGameFeatured extends Vue {
	@Prop(FeaturedItem)
	item!: FeaturedItem;

	get game() {
		return this.item.game!;
	}
}
