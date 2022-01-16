<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { Screen } from '../../screen/screen-service';
import { useCommonStore } from '../../store/common-store';
import AppTimelineListItem from '../../timeline-list/item/item.vue';
import AppUserAvatarImg from '../../user/user-avatar/img/img.vue';

@Options({
	components: {
		AppUserAvatarImg,
		AppTimelineListItem,
	},
})
export default class AppMessageThreadAdd extends Vue {
	@Prop(Boolean) hideMessageSplit!: boolean;

	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}

	readonly Screen = Screen;
}
</script>

<template>
	<div class="message-thread-add">
		<app-timeline-list-item>
			<template #bubble>
				<app-user-avatar-img :user="app.user" />
			</template>

			<div class="timeline-list-item-details">
				<slot />
			</div>
		</app-timeline-list-item>
		<hr v-if="!hideMessageSplit" class="message-thread-split" />
	</div>
</template>
