import { Component } from 'vue-property-decorator';
import { Api } from '../../../../../_common/api/api.service';
import { BaseRouteComponent, RouteResolver } from '../../../../../_common/route/route-component';
import AppStickerCollect from '../../../../../_common/sticker/collect/collect.vue';
import { InitPayload } from '../stickers';

@Component({
	name: 'RouteDashStickersCollect',
	components: {
		AppStickerCollect,
	},
})
@RouteResolver({
	deps: {},
	resolver: () => Api.sendRequest('/web/stickers/dash'),
})
export default class RouteDashStickersCollect extends BaseRouteComponent {
	balance = 0;
	stickerCost = 10;

	get routeTitle() {
		return this.$gettext(`Collect Stickers`);
	}

	routeResolved($payload: InitPayload) {
		this.balance = 100; // $payload.balance;
		this.stickerCost = $payload.stickerCost;
	}

	onStickerPurchase() {
		this.balance -= this.stickerCost;
	}
}
