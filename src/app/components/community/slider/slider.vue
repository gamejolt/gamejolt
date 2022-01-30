<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { Community } from '../../../../_common/community/community.model';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppCommunitySliderAddItem from './add-item/add-item.vue';
import AppCommunitySliderDiscoverItem from './discover-item/discover-item.vue';
import AppCommunitySliderItem from './item/item.vue';

@Options({
	components: {
		AppCommunitySliderItem,
		AppCommunitySliderAddItem,
		AppCommunitySliderDiscoverItem,
		AppScrollScroller,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppCommunitySlider extends Vue {
	@Prop({ type: Array, required: true })
	communities!: Community[];

	@Prop({ type: Boolean, required: false })
	withAddButton?: boolean;

	@Prop({ type: String, required: false, default: 'global' })
	eventCat!: string;

	get addButtonSize() {
		return Screen.isXs ? 60 : 100;
	}
}
</script>

<template>
	<div v-if="communities.length || withAddButton" class="-list">
		<AppScrollScroller class="-scroller" horizontal thin>
			<div class="-flex">
				<AppCommunitySliderItem
					v-for="community of communities"
					:key="community.id"
					:community="community"
					:event-cat="eventCat"
				/>

				<AppCommunitySliderDiscoverItem />
				<AppCommunitySliderAddItem v-if="withAddButton" />
			</div>
		</AppScrollScroller>
	</div>
</template>

<style lang="stylus" src="./slider.styl" scoped></style>
