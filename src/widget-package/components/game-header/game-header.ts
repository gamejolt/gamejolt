import { Options, Vue } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Environment } from '../../../_common/environment/environment.service';
import { Sellable } from '../../../_common/sellable/sellable.model';
import { AppTooltip } from '../../../_common/tooltip/tooltip-directive';
import { Store } from '../../store/index';
import AppIncludedItems from '../included-items/included-items.vue';
import AppModal from '../modal/modal.vue';
import AppPricingCard from '../pricing-card/pricing-card.vue';

@Options({
	components: {
		AppPricingCard,
		AppModal,
		AppIncludedItems,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppGameHeader extends Vue {
	@State game!: Store['game'];
	@State developer!: Store['developer'];
	@State sellable!: Store['sellable'];
	@State packageCard!: Store['packageCard'];

	isShowingIncluded = false;

	get gameUrl() {
		// `https://gamejolt.com/games/${game.slug}/${game.id}`
		return Environment.baseUrl + this.game.getUrl();
	}

	get developerUrl() {
		return this.developer.web_site || Environment.baseUrl + this.developer.url;
	}

	get shouldShowIncluded() {
		return this.sellable.type !== Sellable.TYPE_FREE;
	}
}
