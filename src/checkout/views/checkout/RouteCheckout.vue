<script lang="ts">
import { CSSProperties, computed, ref } from 'vue';
import { Api } from '../../../_common/api/api.service';
import AppAspectRatio from '../../../_common/aspect-ratio/AppAspectRatio.vue';
import { Environment } from '../../../_common/environment/environment.service';
import { GameModel } from '../../../_common/game/game.model';
import { GamePackageModel } from '../../../_common/game/package/package.model';
import { showErrorGrowl } from '../../../_common/growls/growls.service';
import AppImgResponsive from '../../../_common/img/AppImgResponsive.vue';
import AppLoading from '../../../_common/loading/AppLoading.vue';
import AppMediaItemCover from '../../../_common/media-item/cover/AppMediaItemCover.vue';
import { MicrotransactionProductModel } from '../../../_common/microtransaction/product.model';
import { ModelData } from '../../../_common/model/model.service';
import { Navigate } from '../../../_common/navigate/navigate.service';
import { OrderModel } from '../../../_common/order/order.model';
import { createAppRoute, defineAppRouteOptions } from '../../../_common/route/route-component';
import { Screen } from '../../../_common/screen/screen-service';
import { useThemeStore } from '../../../_common/theme/theme.store';
import { kThemeFgMuted } from '../../../_common/theme/variables';
import { $gettext } from '../../../_common/translate/translate.service';
import { styleFlexCenter, styleMaxWidthForOptions } from '../../../_styles/mixins';
import { kFontFamilyDisplay, kLineHeightComputed } from '../../../_styles/variables';
import FormPayment from '../../components/forms/FormPayment.vue';

export default {
	...defineAppRouteOptions({
		reloadOn: 'always',
		resolver: ({ route }) => Api.sendRequest('/web/checkout/' + route.params.orderHash),
	}),
};

const CheckoutThemeKey = 'checkout';

interface Payload {
	order: ModelData<OrderModel>;
	cards: any[];
	stripePublishableKey: string;
}
</script>

<script lang="ts" setup>
const order = ref<OrderModel | null>(null);
const cards = ref<any[]>([]);
const { setPageTheme, clearPageTheme } = useThemeStore();

const routeTitle = computed(() => {
	// Before the payload is processed:
	if (!order.value || !order.value.items) {
		return $gettext(`Checkout`);
	}

	const orderItem = order.value.items[0];
	if (orderItem.sellable) {
		if (order.value.items.length > 1) {
			return $gettext('Buy %{ title } and %{ num } other(s)', {
				title: orderItem.sellable.title,
				num: order.value.items.length - 1,
			});
		} else {
			return $gettext('Buy %{ title }', {
				title: orderItem.sellable.title,
			});
		}
	}
	return null;
});

const orderTitle = computed(() => {
	if (!order.value || !order.value.items) {
		return $gettext(`Your Order`);
	}

	const orderItem = order.value.items[0];
	if (orderItem.sellable) {
		return orderItem.sellable.title;
	}

	return $gettext(`Your Order`);
});

const orderSubtitle = computed(() => {
	if (maybeGame.value !== null && maybeGame.value.developer.display_name) {
		return maybeGame.value.developer.display_name;
	}

	return null;
});

const maybeGame = computed(() => {
	if (!order.value) {
		return null;
	}

	for (const orderItem of order.value.items) {
		if (
			orderItem.sellable.resource_model instanceof GamePackageModel &&
			orderItem.sellable.resource_model.game instanceof GameModel
		) {
			return orderItem.sellable.resource_model.game;
		}
	}

	return null;
});

const maybeMicrotransaction = computed(() => {
	if (!order.value) {
		return null;
	}

	for (const orderItem of order.value.items) {
		if (orderItem.sellable.resource_model instanceof MicrotransactionProductModel) {
			return orderItem.sellable.resource_model;
		}
	}

	return null;
});

const { isBootstrapped } = createAppRoute({
	routeTitle,
	onResolved({ payload }: { payload: Payload }) {
		order.value = new OrderModel(payload.order);
		cards.value = payload.cards || [];

		setTheme();

		// TODO(vue3): remove once we can include the stripe JS file in index.html?
		if (typeof window.Stripe !== 'undefined') {
			(window.Stripe as any).setPublishableKey(payload.stripePublishableKey);
		}
	},
	onDestroyed() {
		clearPageTheme(CheckoutThemeKey);
	},
});

function setTheme() {
	// If there are any games in the order items, use the first one to set the page's theme.
	let theme = maybeGame.value?.theme || null;

	setPageTheme({
		key: CheckoutThemeKey,
		theme,
	});
}

function onFormSubmit(response: any) {
	let redirect: string | null = response.redirectUrl;

	if (GJ_IS_DESKTOP_APP && redirect) {
		// Replaces "https://gamejolt.com" with whatever the desktop app has as its base url.
		redirect = redirect.replace(Environment.baseUrl, Environment.wttfBaseUrl);
	}

	if (!redirect) {
		showErrorGrowl($gettext(`Could not redirect.`));
		return;
	}

	Navigate.goto(redirect);
}

const headingStyles = computed<CSSProperties>(() => ({
	marginTop: maybeMicrotransaction.value ? `16px` : kLineHeightComputed.value * 2 + 'px',
	marginBottom: 0,
	fontFamily: kFontFamilyDisplay,
}));
</script>

<template>
	<section class="container" :style="{ overflow: `hidden` }">
		<template v-if="!isBootstrapped">
			<AppLoading big centered />
		</template>
		<template v-else>
			<div v-if="maybeGame" class="_game-cover">
				<AppMediaItemCover
					v-if="maybeGame.header_media_item"
					:media-item="maybeGame.header_media_item"
				/>
			</div>
			<div v-else-if="maybeMicrotransaction" :style="styleFlexCenter()">
				<div
					:style="{
						...styleMaxWidthForOptions({
							ratio: 1,
							maxWidth: 160,
							maxHeight: Screen.height * 0.3,
						}),
						flex: `auto`,
					}"
				>
					<AppAspectRatio :ratio="1">
						<AppImgResponsive
							:style="{
								width: `100%`,
								height: `100%`,
								objectFit: `contain`,
							}"
							:src="maybeMicrotransaction.media_item.mediaserver_url"
						/>
					</AppAspectRatio>
				</div>
			</div>

			<div class="text-center">
				<h1 :style="headingStyles">
					{{ orderTitle }}
				</h1>
				<h4
					v-if="orderSubtitle"
					:style="{
						color: kThemeFgMuted,
						marginTop: 0,
						marginBottom: kLineHeightComputed.px,
						fontFamily: kFontFamilyDisplay,
					}"
				>
					<template v-if="maybeGame">
						{{ $gettext(`by`) }}
						{{ ' ' }}
					</template>
					{{ orderSubtitle }}
				</h4>
			</div>
			<br />

			<FormPayment v-if="order" :cards="cards" :order="order" @submit="onFormSubmit" />
		</template>
	</section>
</template>

<style lang="stylus" scoped>
._game-cover
	margin-top: -($grid-gutter-width / 2)
	margin-right: -($grid-gutter-width-xs / 2)
	margin-left: -($grid-gutter-width-xs / 2)

	@media $media-sm-up
		margin-right: -($grid-gutter-width / 2)
		margin-left: -($grid-gutter-width / 2)
</style>
