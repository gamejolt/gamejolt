<template>
	<app-scroll-scroller class="fill-darker" horizontal thin>
		<div class="-items" :style="{ height: mediaBarHeight + 'px' }">
			<a class="-add" @click="add()">
				<div
					class="-add-inner"
					:style="{
						width: addButtonSize + 'px',
						height: addButtonSize + 'px',
					}"
				>
					<div>
						<app-jolticon icon="add" big />
						<br />
						<b class="-label">
							<translate>Add Media</translate>
						</b>
					</div>
				</div>
			</a>

			<draggable
				style="display: inline-flex"
				v-model="draggableItems"
				:options="{ delay: 100, delayOnTouchOnly: true }"
			>
				<div v-for="item of draggableItems" :key="item.id">
					<app-game-media-bar-item class="-item" :item="item" @click.native="open(item)">
						<app-editable-overlay class="-item-hover hidden-xs" @click="open(item)">
							<template slot="overlay">
								<translate>click to edit</translate>
								<br />
								<translate>drag to sort</translate>
							</template>
						</app-editable-overlay>
					</app-game-media-bar-item>
				</div>
			</draggable>
		</div>
	</app-scroll-scroller>
</template>

<style lang="stylus" src="./media-bar.styl" scoped></style>

<script lang="ts" src="./media-bar"></script>
