<script lang="ts" src="./panel"></script>

<template>
	<div class="inset-container-controls">
		<transition name="fade">
			<AppEmoji
				v-if="visible"
				v-app-tooltip="panelVisible ? '' : $gettext('Insert Emoji')"
				class="emoji-button"
				:class="{
					'emoji-button-active': panelVisible,
				}"
				tabindex="1"
				@click="onButtonClick"
				@mousedown="onMouseDown"
				@mouseenter="onMouseEnter"
			/>
		</transition>
		<transition name="fade">
			<div
				v-if="visible && panelVisible"
				ref="panel"
				class="emoji-panel"
				tabindex="1"
				@focus="onPanelFocus"
				@blur="onPanelBlur"
			>
				<div
					v-for="emoji of emojis"
					:key="emoji"
					class="emoji-box"
					:title="':' + emoji + ':'"
					@click="onClickEmoji(emoji)"
				>
					<AppEmoji :emoji="emoji" />
				</div>
			</div>
		</transition>
	</div>
</template>

<style lang="stylus" src="./panel.styl" scoped></style>
