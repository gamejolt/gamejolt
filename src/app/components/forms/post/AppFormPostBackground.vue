<script lang="ts" setup>
import { PropType } from 'vue';
import { Background } from '../../../../_common/background/background.model';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import AppFormGroup from '../../../../_common/form-vue/AppFormGroup.vue';
import AppImgResponsive from '../../../../_common/img/AppImgResponsive.vue';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';

const props = defineProps({
	backgrounds: {
		required: true,
		type: Array as PropType<Array<Background>>,
	},
	post: {
		required: true,
		type: Object as PropType<FiresidePost>,
	},
});

const emit = defineEmits({
	backgroundChange: (_item?: Background) => true,
});

function onSelect(item?: Background) {
	let result = item;
	if (item?.id === props.post.background?.id) {
		result = undefined;
	}
	emit('backgroundChange', result);
}
</script>

<template>
	<AppFormGroup
		name="background"
		class="sans-margin-bottom"
		hide-label
		optional
		:label="$gettext(`Background`)"
	>
		<AppScrollScroller horizontal thin>
			<div class="-items">
				<a
					v-for="item in backgrounds"
					:key="item.id"
					:class="{ '-active': post.background?.id === item.id }"
					class="-item"
					@click="() => onSelect(item)"
				>
					<AppImgResponsive :src="item.media_item.mediaserver_url" />
				</a>
			</div>
		</AppScrollScroller>
	</AppFormGroup>
</template>

<style lang="stylus" scoped>

$-height = 56px
$-padding = 12px
$-border-width = $border-width-large

.-items
	white-space: nowrap
	height: $-height
	display: inline-flex
	grid-gap: $-padding

.-item
	rounded-corners()
	overflow: hidden
	width: $-height
	height: $-height
	border-width: $-border-width
	border-style: none
	transition: border 0.1s ease

	&:hover
		theme-prop('border-color', 'link')
		border-style: solid

	&.-active
		border-style: solid
</style>
