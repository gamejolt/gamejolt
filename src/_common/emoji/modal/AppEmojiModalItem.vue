<script lang="ts" setup>
import { PropType, toRefs } from 'vue';
import { styleBorderRadiusCircle, styleFlexCenter, styleWhen } from '../../../_styles/mixins';
import AppAspectRatio from '../../aspect-ratio/AppAspectRatio.vue';
import AppJolticon from '../../jolticon/AppJolticon.vue';
import { kThemeBgSubtle, kThemeFg } from '../../theme/variables';
import { vAppTooltip } from '../../tooltip/tooltip-directive';
import { Emoji } from '../emoji.model';

const props = defineProps({
	emoji: {
		type: Object as PropType<Emoji>,
		default: undefined,
	},
});

const { emoji } = toRefs(props);

const emit = defineEmits({
	select: (_emoji: Emoji) => true,
});

function onClickEmoji() {
	if (!emoji?.value) {
		return;
	}
	emit('select', emoji.value);
}
</script>

<template>
	<div>
		<AppAspectRatio :ratio="1">
			<div
				:style="{
					...styleFlexCenter(),
					width: `100%`,
					height: `100%`,
					...styleWhen(!!emoji, {
						cursor: `pointer`,
					}),
				}"
				@click="onClickEmoji"
			>
				<img
					v-if="emoji"
					v-app-tooltip="emoji.short_name"
					:style="[
						'user-drag: none',
						{
							width: `100%`,
							maxHeight: `100%`,
							height: `auto`,
						},
					]"
					:src="emoji.img_url"
					draggable="false"
					alt=""
				/>
				<div
					v-else
					v-app-tooltip.touchable="$gettext(`You haven't unlocked this yet.`)"
					:style="{
						...styleBorderRadiusCircle,
						...styleFlexCenter(),
						background: kThemeBgSubtle,
						width: `100%`,
						height: `100%`,
					}"
				>
					<!-- TODO(reactions) better icon. I would use the
					help-circle jolticon itself, but that makes things difficult
					if we want to size this dynamically. -->
					<AppJolticon
						icon="other-os"
						:style="{
							color: kThemeFg,
							margin: 0,
						}"
						big
					/>
				</div>
			</div>
		</AppAspectRatio>
	</div>
</template>
