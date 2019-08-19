<template>
	<div class="inset-container-controls">
		<transition name="fade">
			<span
				v-if="visible"
				class="emoji-button"
				:class="spanClass"
				tabindex="1"
				@click="onButtonClick"
				@mousedown="onMouseDown"
				@mouseenter="onMouseEnter"
				v-app-tooltip="panelVisible ? '' : $gettext('Insert Emoji')"
			/>
		</transition>
		<transition name="fade">
			<div
				v-if="visible && panelVisible"
				class="emoji-panel"
				ref="panel"
				@focus="onPanelFocus"
				@blur="onPanelBlur"
				tabindex="1"
			>
				<div
					v-for="emoji of emojis"
					:key="emoji"
					class="emoji-box"
					@click="onClickEmoji(emoji)"
					:title="':' + emoji + ':'"
				>
					<span :class="'emoji-selector emoji emoji-' + emoji" />
				</div>
			</div>
		</transition>
	</div>
</template>

<style lang="stylus" src="./panel.styl" scoped></style>

<script lang="ts" src="./panel"></script>
