<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { GameModel } from '../../../../_common/game/game.model';
import AppGameListItem from './item/item.vue';

@Options({
	components: {
		AppGameListItem,
	},
})
export default class AppGameList extends Vue {
	@Prop(Array)
	games!: GameModel[];

	@Prop(String)
	eventLabel?: string;
}
</script>

<template>
	<div class="game-list">
		<AppGameListItem
			v-for="game of games"
			:key="game.id"
			:game="game"
			:event-label="eventLabel"
		/>
	</div>
</template>
