<script lang="ts">
import { computed, ref } from 'vue';
import { Api } from '../../../_common/api/api.service';
import { Environment } from '../../../_common/environment/environment.service';
import { Game } from '../../../_common/game/game.model';
import { GamePackage } from '../../../_common/game/package/package.model';
import { showErrorGrowl } from '../../../_common/growls/growls.service';
import AppLoading from '../../../_common/loading/AppLoading.vue';
import AppMediaItemCover from '../../../_common/media-item/cover/cover.vue';
import { ModelData } from '../../../_common/model/model.service';
import { Navigate } from '../../../_common/navigate/navigate.service';
import { Order } from '../../../_common/order/order.model';
import { createAppRoute, defineAppRouteOptions } from '../../../_common/route/route-component';
import { useThemeStore } from '../../../_common/theme/theme.store';
import { $gettext, $gettextInterpolate } from '../../../_common/translate/translate.service';
import FormPayment from '../../components/forms/payment/payment.vue';

export default {
	...defineAppRouteOptions({
		resolver: ({ route }) => Api.sendRequest('/web/checkout/' + route.params.orderHash),
	}),
	components: { AppLoading, AppMediaItemCover, FormPayment },
};

const CheckoutThemeKey = 'checkout';

interface Payload {
	order: ModelData<Order>;
	cards: any[];
	stripePublishableKey: string;
}
</script>

<script lang="ts" setup>
const order = ref<Order | null>(null);
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
			return $gettextInterpolate('Buy %{ title } and %{ num } other(s)', {
				title: orderItem.sellable.title,
				num: order.value.items.length - 1,
			});
		} else {
			return $gettextInterpolate('Buy %{ title }', {
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

	// TODO: mtx sellable subtitle.
	return 'test';
});

const maybeGame = computed(() => {
	if (!order.value) {
		return null;
	}

	for (const orderItem of order.value.items) {
		if (
			orderItem.sellable.resource_model instanceof GamePackage &&
			orderItem.sellable.resource_model.game instanceof Game
		) {
			return orderItem.sellable.resource_model.game;
		}
	}

	return null;
});

const { isBootstrapped } = createAppRoute({
	routeTitle,
	onResolved({ payload }: { payload: Payload }) {
		order.value = new Order(payload.order);
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

function onFormSubmit(_formModel: any, response: any) {
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
</script>

<template>
	<section class="container _section">
		<template v-if="!isBootstrapped">
			<AppLoading big centered />
		</template>
		<template v-else>
			<!-- TODO: have some kind of visual for MTX sellables. -->
			<div v-if="maybeGame" class="_game-cover">
				<AppMediaItemCover
					v-if="maybeGame.header_media_item"
					:media-item="maybeGame.header_media_item"
				/>
			</div>

			<div class="text-center">
				<h1>
					{{ orderTitle }}
				</h1>
				<h4>
					{{ $gettext(`by`) }}
					{{ ' ' }}
					{{ orderSubtitle }}
				</h4>
			</div>
			<br />

			<FormPayment :cards="cards" :order="order" @submit="onFormSubmit" />
		</template>
	</section>
</template>

<style lang="stylus" scoped>
._section
	overflow: hidden

._game-cover
	margin-top: -($grid-gutter-width / 2)
	margin-right: -($grid-gutter-width-xs / 2)
	margin-left: -($grid-gutter-width-xs / 2)

	@media $media-sm-up
		margin-right: -($grid-gutter-width / 2)
		margin-left: -($grid-gutter-width / 2)

h1
	margin-top: $line-height-computed * 2
	margin-bottom: 0

h4
	theme-prop('color', 'fg-muted')
	margin-top: 0
	margin-bottom: $line-height-computed
	font-family: $font-family-base
</style>
