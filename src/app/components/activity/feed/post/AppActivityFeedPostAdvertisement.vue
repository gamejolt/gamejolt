<script lang="ts">
import { computed } from 'vue';

import AppActivityFeedPostWrapper from '~app/components/activity/feed/post/AppActivityFeedPostWrapper.vue';
import {
	kPostItemPaddingVertical,
	kPostItemPaddingXsVertical,
	PostContentContainerStyles,
	PostContentLeadStyles,
	PostFeedItemContainerStyles,
	PostHeaderAvatarStyles,
	PostHeaderBylineNameStyles,
	PostHeaderBylineStyles,
	PostHeaderContentStyles,
	PostHeaderMetaStyles,
	PostHeaderStyles,
} from '~app/components/post/post-styles';
import AppAspectRatio from '~common/aspect-ratio/AppAspectRatio.vue';
import AppButton from '~common/button/AppButton.vue';
import AppImgResponsive from '~common/img/AppImgResponsive.vue';
import { Screen } from '~common/screen/screen-service';
import AppScrollInview, { ScrollInviewConfig } from '~common/scroll/inview/AppScrollInview.vue';
import { $gettext } from '~common/translate/translate.service';
import { styleAbsoluteFill } from '~styles/mixins';
import { kBorderRadiusLg } from '~styles/variables';

const inviewConfig = new ScrollInviewConfig();
</script>

<script lang="ts" setup>
type Props = {
	href: string;
	avatarSrc: string;
	displayName: string;
	mediaSrc: string;
	leadContent: string;
	actionText?: string;
};

defineProps<Props>();

const emit = defineEmits<{ click: []; inview: [] }>();

const vPadding = computed(() =>
	Screen.isXs ? kPostItemPaddingXsVertical : kPostItemPaddingVertical
);
</script>

<template>
	<AppScrollInview :config="inviewConfig" @inview="emit('inview')">
		<div :style="PostFeedItemContainerStyles">
			<AppActivityFeedPostWrapper>
				<a
					:style="{
						...styleAbsoluteFill({ zIndex: 2 }),
					}"
					:href
					target="_blank"
					@click="emit('click')"
				/>
				<div :style="PostHeaderStyles">
					<div :style="PostHeaderContentStyles">
						<div :style="PostHeaderAvatarStyles">
							<img
								:src="avatarSrc"
								class="img-responsive"
								:style="{
									borderRadius: `50%`,
								}"
								alt=""
							/>
						</div>
						<div :style="PostHeaderBylineStyles">
							<div :style="PostHeaderBylineNameStyles(false)">
								{{ displayName }}
							</div>
						</div>
					</div>
					<div :style="PostHeaderMetaStyles">
						<span class="tag">
							{{ $gettext(`Promoted`) }}
						</span>
					</div>
				</div>

				<div
					:style="{
						marginTop: vPadding.px,
						overflow: `hidden`,
						borderRadius: kBorderRadiusLg.px,
					}"
				>
					<AppAspectRatio :ratio="1">
						<AppImgResponsive :src="mediaSrc" alt="Advertisement" />
					</AppAspectRatio>
				</div>

				<div :style="PostContentContainerStyles(false)">
					<div :style="PostContentLeadStyles" class="fireside-post-lead-content">
						{{ leadContent }}
					</div>
				</div>

				<div v-if="actionText" :style="{ marginTop: `24px` }">
					<AppButton block primary solid>{{ actionText }}</AppButton>
				</div>
			</AppActivityFeedPostWrapper>
		</div>
	</AppScrollInview>
</template>
