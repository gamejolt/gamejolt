<template>
	<app-scroll-scroller overlay horizontal class="fill-darker">
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
						<b>
							<translate>Add Media</translate>
						</b>
					</div>
				</div>
			</a>

			<draggable style="display: inline-block" v-model="draggableItems">
				<app-media-bar-item
					class="-item"
					v-for="item of draggableItems"
					:key="item.id"
					:item="item"
					@click.native="open(item)"
				>
					<app-editable-overlay class="-item-hover hidden-xs" @click="open(item)">
						<template slot="overlay">
							<translate>click to edit</translate>
							<br />
							<translate>drag to sort</translate>
						</template>
					</app-editable-overlay>
				</app-media-bar-item>
			</draggable>
		</div>
	</app-scroll-scroller>
</template>

<style lang="stylus" src="./media-bar.styl" scoped></style>

<script lang="ts" src="./media-bar"></script>
