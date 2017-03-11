import * as Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./thumbnail.html?style=./thumbnail.styl';

import { SellablePricing } from '../../../../lib/gj-lib-client/components/sellable/pricing/pricing.model';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { getProvider } from '../../../../lib/gj-lib-client/utils/utils';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppGameThumbnailImg } from '../../../../lib/gj-lib-client/components/game/thumbnail-img/thumbnail-img';
import { AppGameCompatIcons } from '../compat-icons/compat-icons';
import { AppVideo } from '../../../../lib/gj-lib-client/components/video/video';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { currency } from '../../../../lib/gj-lib-client/vue/filters/currency';
import { AppPopoverTrigger } from '../../../../lib/gj-lib-client/components/popover/popover-trigger.directive.vue';
import { AppPopover } from '../../../../lib/gj-lib-client/components/popover/popover';
import { AppGameModLinks } from '../mod-links/mod-links';

@View
@Component({
	name: 'game-thumbnail',
	components: {
		AppJolticon,
		AppGameThumbnailImg,
		AppGameCompatIcons,
		AppVideo,
		AppPopover,
		AppGameModLinks,
	},
	directives: {
		AppPopoverTrigger,
	}
})
export class AppGameThumbnail extends Vue
{
	@Prop( Object ) game: Game;
	@Prop( String ) linkTo?: string;
	@Prop( { type: Boolean, default: false } ) autoplay: boolean;
	@Prop( { type: Boolean, default: false } ) hidePricing: boolean;
	@Prop( { type: Boolean, default: false } ) animateEnter: boolean;

	@Prop( Number ) slotId: number;

	showModTools = false;
	isHovered = false;

	pricing: SellablePricing | null = null;
	sale = false;
	salePercentageOff = '';
	saleOldPricing: SellablePricing | null = null;

	Screen = makeObservableService( Screen );

	get isActive()
	{
		return this.isHovered || this.autoplay;
	}

	get url()
	{
		if ( this.linkTo === 'dashboard' ) {
			return this.game.getUrl( 'dashboard' );
		}
		else if ( this.linkTo ) {
			return this.linkTo;
		}

		return this.game.getUrl();
	}

	get isOwned()
	{
		return this.game.sellable && this.game.sellable.is_owned;
	}

	get sellableType()
	{
		return this.game.sellable && this.game.sellable.type;
	}

	get pricingAmount()
	{
		return this.pricing && currency( this.pricing.amount, '' );
	}

	get oldPricingAmount()
	{
		return this.saleOldPricing && currency( this.saleOldPricing.amount, '' );
	}

	mounted()
	{
		const App = getProvider<any>( 'App' );

		if ( App.user && App.user.permission_level >= 3 ) {
			this.showModTools = true;
		}

		// Pricing info.
		if ( this.game.sellable && Array.isArray( this.game.sellable.pricings ) ) {
			this.pricing = this.game.sellable.pricings[0];
			if ( this.pricing.promotional ) {
				this.saleOldPricing = this.game.sellable.pricings[1];
				this.sale = true;
				this.salePercentageOff = ((this.saleOldPricing.amount - this.pricing.amount) / this.saleOldPricing.amount * 100).toFixed( 0 );
			}
		}
	}
}
