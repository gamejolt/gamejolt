<script lang="ts" setup>
import { ref } from 'vue';

const lgSelector = ref(0);
</script>

<template>
	<section id="styleguide-list-groups" class="section">
		<h1 class="section-header">List Groups</h1>

		<div class="list-group" style="max-width: 400px">
			<div class="list-group-item">This is an item</div>
			<div class="list-group-item">This is a second item</div>
			<div class="list-group-item">
				<span class="badge">3</span>
				You can add badges
			</div>
			<div class="list-group-item">
				<span class="tag">tag</span>
				And tags!
			</div>
			<div class="list-group-item">
				<span class="badge">3</span>
				<span class="tag">tag</span>
				And even both tags and badges
			</div>
			<div class="list-group-item">
				<span class="tag tag-notice">3</span>
				<span class="tag tag-highlight">3</span>
				Notification tags get floated right
			</div>
			<div class="list-group-item has-icon">
				<span class="jolticon jolticon-chevron-right" />
				Use
				<code>.has-icon</code>
				for ones with icons
			</div>
			<div class="list-group-item active">
				Force an active state with
				<code>.active</code>
			</div>
		</div>

		<h3>Thin Lists</h3>

		<p>
			You can make all items thinner by adding
			<code>.thin</code>
			.
		</p>

		<div class="list-group thin" style="max-width: 400px">
			<div class="list-group-item">
				<span class="badge">3</span>
				This is thin
			</div>
			<div class="list-group-item">
				<span class="tag">inactive</span>
				This is thin
			</div>
			<div class="list-group-item">
				<span class="tag tag-notice">3</span>
				This is thin
			</div>
		</div>

		<h3>Clickable Lists</h3>

		<p>
			Use an
			<code>&lt;a&gt;</code>
			tag for
			<code>.list-group-item</code>
			to produce a hover effect.
		</p>

		<div class="list-group" style="max-width: 400px">
			<a class="list-group-item"> This is an item </a>
			<a class="list-group-item"> This is a second item </a>
			<a class="list-group-item disabled">
				Disable by adding
				<code>.disabled</code>
			</a>
		</div>

		<h3>Complex Content</h3>

		<div class="list-group" style="max-width: 400px">
			<div class="list-group-item">
				<h4 class="list-group-item-heading">This is a Heading</h4>
				<p class="list-group-item-text">
					This is some body content. It will wrap if the line gets too long, which I think
					is pretty nice.
				</p>
			</div>
			<div class="list-group-item">
				<div class="list-group-item-heading">
					Headings don't have to be heading tags. They can appear as normal text.
				</div>
				<p class="list-group-item-text">This is some body content.</p>
			</div>
			<div class="list-group-item has-icon">
				<h4 class="list-group-item-heading">
					<span class="jolticon jolticon-notice" />
					Icons work as well
				</h4>
				<p class="list-group-item-text">
					It will indent the whole body to align correctly with the heading.
				</p>
			</div>
			<div class="list-group-item">
				<h4 class="list-group-item-heading">Paragraphs</h4>
				<p class="list-group-item-text">
					You can add multiple
					<code>.list-group-item-text</code>
					components to have them act as paragraphs with some vertical spacing in between.
				</p>
				<p class="list-group-item-text">
					This is the second
					<code>.list-group-item-text</code>
					component.
				</p>
			</div>
		</div>

		<h3>Addons</h3>

		<p>
			You can use
			<code>.list-group-item-addon</code>
			s and the
			<code>.has-addon</code>
			class to take up constant width for styling selections.
		</p>

		<div class="list-group" style="max-width: 400px">
			<a class="list-group-item has-addon" @click="lgSelector = 0">
				<div class="list-group-item-addon">
					<span v-if="lgSelector === 0" class="jolticon jolticon-check" />
				</div>
				Item One
			</a>
			<a class="list-group-item has-addon" @click="lgSelector = 1">
				<div class="list-group-item-addon">
					<span v-if="lgSelector === 1" class="jolticon jolticon-check" />
				</div>
				Item Two
			</a>
			<a class="list-group-item has-addon has-icon" @click="lgSelector = 2">
				<div class="list-group-item-addon">
					<span v-if="lgSelector === 2" class="jolticon jolticon-check" />
				</div>
				<span class="jolticon jolticon-html5" />
				You can also add icons with addons
			</a>
		</div>

		<h3>Dark Variant</h3>

		<p>
			Simply add
			<code>.list-group-dark</code>
			and it'll be a dark version!
		</p>

		<div class="list-group list-group-dark" style="max-width: 400px">
			<a class="list-group-item"> This is an item </a>
			<a class="list-group-item"> This is a second item </a>
			<div class="list-group-item active">Forced active state</div>
			<a class="list-group-item disabled"> Disabled </a>
			<a class="list-group-item">
				<span class="badge">3</span>
				With badges
			</a>
			<a class="list-group-item">
				<span class="tag">tag</span>
				With tags
			</a>
			<a class="list-group-item has-icon">
				<span class="jolticon jolticon-chevron-right" />
				With icons
			</a>
			<a class="list-group-item has-icon">
				<h4 class="list-group-item-heading">
					<span class="jolticon jolticon-notice" />
					Complex content
				</h4>
				<p class="list-group-item-text">
					It will indent the whole body to align correctly with the heading.
				</p>
			</a>
			<a class="list-group-item has-addon has-icon">
				<div class="list-group-item-addon">
					<span class="jolticon jolticon-check" />
				</div>
				<span class="jolticon jolticon-html5" />
				With addons
			</a>
			<div class="list-group-item has-icon">
				<h4 class="list-group-item-heading">
					<span class="jolticon jolticon-notice" />
					Complex
					<a>content</a>
				</h4>
				<p class="list-group-item-text">This item is not a link, but it contains links.</p>
				<p class="list-group-item-text">
					It will
					<a>indent the whole</a>
					body to align correctly with the heading.
				</p>
			</div>
		</div>

		<h3>In Popovers</h3>

		<p>
			In popover components they will be styled a tad differently to fit within the popover
			better.
		</p>

		<div class="popover popover-in-place">
			<div class="popover-content">
				<div class="list-group">
					<a class="list-group-item"> This is an item </a>
					<a class="list-group-item"> This is a second item </a>
					<a class="list-group-item disabled"> Disabled </a>
				</div>
			</div>
		</div>
	</section>
</template>
