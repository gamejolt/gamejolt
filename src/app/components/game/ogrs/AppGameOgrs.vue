<script lang="ts" setup>
import { computed } from 'vue';
import { GameModel } from '../../../../_common/game/game.model';
import AppGameOgrsTag from './tag.vue';

type Props = {
	game: GameModel;
	hideDescriptors?: boolean;
	hideTag?: boolean;
};

const { game, hideDescriptors, hideTag } = defineProps<Props>();

const descriptors = computed(() => {
	if (!game || hideDescriptors) {
		return [];
	}

	const descriptors: string[] = [];

	if (game.tigrs_cartoon_violence) {
		let descriptor = '';
		if (game.tigrs_cartoon_violence === 1) {
			descriptor = 'Mild ';
		} else if (game.tigrs_cartoon_violence === 3) {
			descriptor = 'Intense ';
		}
		descriptors.push(descriptor + 'Cartoon Violence');
	}

	if (game.tigrs_fantasy_violence) {
		let descriptor = '';
		if (game.tigrs_fantasy_violence === 1) {
			descriptor = 'Mild ';
		} else if (game.tigrs_fantasy_violence === 3) {
			descriptor = 'Intense ';
		}
		descriptors.push(descriptor + 'Fantasy Violence');
	}

	if (game.tigrs_realistic_violence) {
		let descriptor = '';
		if (game.tigrs_realistic_violence === 1) {
			descriptor = 'Mild ';
		} else if (game.tigrs_realistic_violence === 3) {
			descriptor = 'Intense ';
		}
		descriptors.push(descriptor + 'Realistic Violence');
	}

	if (game.tigrs_bloodshed) {
		if (game.tigrs_bloodshed === 1) {
			descriptors.push('Animated Bloodshed');
		} else if (game.tigrs_bloodshed === 2) {
			descriptors.push('Realistic Bloodshed');
		} else if (game.tigrs_bloodshed === 3) {
			descriptors.push('Blood and Gore');
		}
	}

	if (game.tigrs_sexual_violence === 1) {
		descriptors.push('Sexual Violence');
	}

	if (game.tigrs_alcohol) {
		if (game.tigrs_alcohol === 1) {
			descriptors.push('Alcohol Reference');
		} else if (game.tigrs_alcohol === 2) {
			descriptors.push('Alcohol Use');
		}
	}

	if (game.tigrs_drugs) {
		if (game.tigrs_drugs === 1) {
			descriptors.push('Drug Reference');
		} else if (game.tigrs_drugs === 2) {
			descriptors.push('Drug Use');
		}
	}

	if (game.tigrs_tobacco) {
		if (game.tigrs_tobacco === 1) {
			descriptors.push('Tobacco Reference');
		} else if (game.tigrs_tobacco === 2) {
			descriptors.push('Tobacco Use');
		}
	}

	if (game.tigrs_nudity) {
		if (game.tigrs_nudity === 1) {
			descriptors.push('Brief Nudity');
		} else if (game.tigrs_nudity === 2) {
			descriptors.push('Nudity');
		}
	}

	if (game.tigrs_sexual_themes) {
		if (game.tigrs_sexual_themes === 1) {
			descriptors.push('Suggestive Themes');
		} else if (game.tigrs_sexual_themes === 2) {
			descriptors.push('Sexual Themes');
		} else if (game.tigrs_sexual_themes === 3) {
			descriptors.push('Graphic Sexual Themes');
		}
	}

	if (game.tigrs_language) {
		let descriptor = '';
		if (game.tigrs_language === 1) {
			descriptor = 'Mild ';
		} else if (game.tigrs_language === 3) {
			descriptor = 'Strong ';
		}
		descriptors.push(descriptor + 'Language');
	}

	if (game.tigrs_humor) {
		if (game.tigrs_humor === 1) {
			descriptors.push('Comical Shenanigans');
		} else if (game.tigrs_humor === 2) {
			descriptors.push('Crass Humor');
		} else if (game.tigrs_humor === 3) {
			descriptors.push('Mature Humor');
		}
	}

	if (game.tigrs_gambling) {
		let descriptor = '';
		if (game.tigrs_gambling === 1) {
			descriptor = 'Simulated ';
		} else if (game.tigrs_gambling === 3) {
			descriptor = 'Real ';
		}
		descriptors.push(descriptor + 'Gambling');
	}

	return descriptors;
});
</script>

<template>
	<div class="clearfix">
		<div
			v-if="game.tigrs_age > 0"
			class="game-ogrs clearfix"
			:class="{
				'has-descriptors': !hideDescriptors && descriptors.length,
				'no-descriptors': !descriptors.length,
				'hide-tag': hideTag,
			}"
		>
			<AppGameOgrsTag v-if="!hideTag" full :game="game" />

			<div v-if="!hideDescriptors && descriptors.length" class="game-ogrs-descriptors">
				<div
					v-for="descriptor of descriptors"
					:key="descriptor"
					class="game-ogrs-descriptor"
				>
					{{ descriptor }}
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.game-ogrs
	rounded-corners()
	margin-bottom: $font-size-base
	border: 4px solid $black
	background: $black

	&.no-descriptors
		float: left

	// Make sure we override the tag.styl file no matter the order of imports.
	&-tag
		float: left
		border: 0 !important

	&-descriptors
		margin-left: 80px
		padding: 10px
		border-left: 4px solid $black
		background: $white
		border-top-right-radius: $border-radius-base - 1px
		border-bottom-right-radius: $border-radius-base - 1px
		min-height: 114px

		.game-ogrs.hide-tag &
			margin-left: 0
			border-left: 0

	&-descriptor
		margin: 0 0 0.5em 0
		font-family: $font-family-tiny
		font-weight: bold
		font-size: $font-size-small
		line-height: 1
		color: $black
</style>