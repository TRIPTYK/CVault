import type { TOC } from '@ember/component/template-only';

const DragIcon: TOC<{ Element: SVGSVGElement }> = <template>
  <svg
    class="w-4 h-4 text-gray-400 cursor-grab"
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <circle cx="5" cy="5" r="1.5" />
    <circle cx="5" cy="10" r="1.5" />
    <circle cx="5" cy="15" r="1.5" />
    <circle cx="10" cy="5" r="1.5" />
    <circle cx="10" cy="10" r="1.5" />
    <circle cx="10" cy="15" r="1.5" />
  </svg>
</template>;
export default DragIcon;
