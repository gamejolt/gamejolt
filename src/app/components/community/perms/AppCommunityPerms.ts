import { PropType, computed, h, toRefs, useSlots } from 'vue';
import { Perm } from '../../../../_common/collaborator/collaboratable';
import { CommunityModel } from '../../../../_common/community/community.model';

// <!--TODO(component-setup-refactor): This component needs to be converted as well?

const props = defineProps({
	community: {
		type: Object as PropType<CommunityModel>,
		required: true,
	},
	required: {
		type: String,
		default: '',
	},
	either: {
		type: Boolean,
	},
	tag: {
		type: String,
		default: 'span',
	},
});

const { community, required, either, tag } = toRefs(props);
const hasPerms = computed(() => {
	const perms = required.value.split(',') as Perm[];

	return community.value.hasPerms(
		perms.filter(perm => !!perm),
		either.value
	);
});

const slots = useSlots();

function render() {
	if (hasPerms.value) {
		return h(tag, {}, slots.default?.());
	}
}
