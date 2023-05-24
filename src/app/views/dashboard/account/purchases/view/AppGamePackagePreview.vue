<script lang="ts" setup>
import { PropType, toRefs } from 'vue';
import { Game } from '../../../../../../_common/game/game.model';
import { GamePackage } from '../../../../../../_common/game/package/package.model';
import AppGameThumbnailImg from '../../../../../../_common/game/thumbnail/AppGameThumbnailImg.vue';

const props = defineProps({
	gamePackage: {
		type: Object as PropType<GamePackage>,
		required: true,
	},
	game: {
		type: Object as PropType<Game>,
		required: true,
	},
});

const { gamePackage, game } = toRefs(props);
</script>

<template>
	<div class="row">
		<div class="col-xs-2">
			<RouterLink style="display: block" :to="game.routeLocation">
				<AppGameThumbnailImg animate :game="game" />
			</RouterLink>
		</div>
		<div class="col-xs-10">
			<p>
				<RouterLink :to="game.routeLocation">
					{{ game.title }}
				</RouterLink>
				<br />
				<span class="small">
					{{ $gettext(`by`) }}
					{{ ' ' }}
					<RouterLink :to="game.developer.routeLocation">
						{{ game.developer.display_name }}
					</RouterLink>
				</span>
			</p>

			<p />

			<h5 class="sans-margin">
				{{ $gettext(`Packages`) }}
			</h5>

			<div class="small text-muted">- {{ gamePackage.title || game.title }}</div>
		</div>
	</div>
</template>
