<script lang="ts" setup>
import { PropType, ref, toRefs } from 'vue';
import { EventItem } from '../../event-item/event-item.model';
import { Realm } from '../realm-model';
import AppSpacer from '../../spacer/AppSpacer.vue';
import AppPostCard from '../../fireside/post/card/AppPostCard.vue';
import { Api } from '../../api/api.service';

const props = defineProps({
	realm: {
		type: Object as PropType<Realm>,
		required: true,
	},
	cardsPerRow: {
		type: Number,
		required: true,
	},
});

const { realm } = toRefs(props);
const items = ref<EventItem[]>([]);

await _fetchFeed();

async function _fetchFeed() {
	const payload = await Api.sendRequest(
		`/web/posts/fetch/realm/${realm.value.path}?perPage=5`,
		{},
		{ detach: true }
	);
	items.value = EventItem.populate(payload.items);
}
</script>

<template>
	<div class="-posts">
		<template v-for="num of cardsPerRow" :key="num">
			<AppSpacer v-if="num > 1" horizontal :scale="4" />

			<div class="-card">
				<template v-if="items[num - 1]">
					<AppPostCard :post="items[num - 1].action" source="realmChunk" with-user />
				</template>
			</div>
		</template>
	</div>
</template>

<style lang="stylus" src="./common.styl" scoped></style>
