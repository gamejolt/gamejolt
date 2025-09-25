<script lang="ts" setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { $gettext } from '../../../../../../_common/translate/translate.service';
import { GameCollectionModel } from '../../collection.model';
import AppGameCollectionThumbnail from '../../thumbnail/AppGameCollectionThumbnail.vue';

type Props = {
	collection: GameCollectionModel;
	eventLabel?: string;
};

const { collection } = defineProps<Props>();

const notOwner = computed(() => collection.from_subscription || !collection.isOwner);
const ownerBang = computed(() => collection.owner!);
</script>

<template>
	<div class="game-collection-grid-item">
		<RouterLink :to="collection.routeLocation">
			<AppGameCollectionThumbnail :collection />

			<div class="game-collection-title h4">
				<template v-if="collection.type === 'developer'">
					<span v-if="notOwner">
						{{ $gettext(`Games made`) }}
						<small>{{
							$gettext(`by %{ developer }`, { developer: '@' + ownerBang.username })
						}}</small>
					</span>
					<template v-else>{{ $gettext(`Your games`) }}</template>
				</template>
				<template v-else-if="collection.type === 'followed'">
					<span v-if="notOwner">
						{{ $gettext(`Games followed`) }}
						<small>{{
							$gettext(`by %{ user }`, { user: '@' + ownerBang.username })
						}}</small>
					</span>
					<template v-else>{{ $gettext(`Your followed games`) }}</template>
				</template>
				<template v-else-if="collection.type === 'owned'">
					<span v-if="notOwner">
						{{ $gettext(`Games owned`) }}
						<small>{{
							$gettext(`by %{ user }`, { user: '@' + ownerBang.username })
						}}</small>
					</span>
					<template v-else>{{ $gettext(`Your owned games`) }}</template>
				</template>
				<template v-else-if="collection.type === 'recommended'">
					<span v-if="notOwner">
						{{ $gettext(`Daily mix`) }}
						<small>{{
							$gettext(`for %{ user }`, { user: '@' + ownerBang.username })
						}}</small>
					</span>
					<template v-else>{{ $gettext(`Your daily mix`) }}</template>
				</template>
				<template v-else>
					{{ collection.name }}
				</template>
			</div>
		</RouterLink>
	</div>
</template>

<style lang="stylus" scoped>
.game-collection-grid-item
	margin-bottom: $grid-gutter-width-xs

	@media $media-sm
		&:nth-child(odd)
			clear: both

	@media $media-md
		&:nth-child(odd)
			clear: both

	@media $media-lg
		&:nth-child(3n+1)
			clear: both

	@media $media-sm-up
		margin-bottom: $grid-gutter-width

	> a
		display: block

.game-collection-title
	margin: 0
	margin-top: $font-size-base

	a &
		color: $headings-color

	> small
		theme-prop('color', 'fg-muted')
</style>
