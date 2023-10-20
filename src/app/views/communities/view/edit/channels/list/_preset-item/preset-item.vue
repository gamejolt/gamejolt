<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import AppCardListItem from '../../../../../../../../_common/card/list/AppCardListItem.vue';
import {
	CommunityModel,
	CommunityPresetChannelType,
	getCommunityChannelBackground,
} from '../../../../../../../../_common/community/community.model';
import { assertNever } from '../../../../../../../../utils/utils';
import AppCommunityChannelCardEdit from '../../../../../../../components/community/channel/card/edit/edit.vue';
import { showCommunityChannelPresetBackgroundModal } from '../../../../../../../components/community/channel/preset-background-modal/preset-background-modal.service';

@Options({
	components: {
		AppCardListItem,
		AppCommunityChannelCardEdit,
	},
})
export default class AppCommunitiesEditChannelListPresetItem extends Vue {
	@Prop({ type: Object, required: true }) community!: CommunityModel;
	@Prop({ type: String, required: true }) presetType!: CommunityPresetChannelType;

	@Emit('edit') emitEdit() {}

	get elementId() {
		return `channel-container-${this.presetType}`;
	}

	// eslint-disable-next-line getter-return
	get label() {
		switch (this.presetType) {
			case CommunityPresetChannelType.ALL:
				return this.$gettext(`All Posts`);
			case CommunityPresetChannelType.FEATURED:
				return this.$gettext(`Frontpage`);
		}

		assertNever(this.presetType);
	}

	get background() {
		return getCommunityChannelBackground(this.community, this.presetType);
	}

	async onClickEditBackground() {
		await showCommunityChannelPresetBackgroundModal(this.community, this.presetType);
		this.emitEdit();
	}
}
</script>

<template>
	<AppCardListItem :id="elementId" :item="{ presetType }">
		<div class="card-title">
			<h5>
				{{ label }}
			</h5>
		</div>

		<template #body>
			<AppCommunityChannelCardEdit :background="background" @click="onClickEditBackground" />
		</template>
	</AppCardListItem>
</template>
