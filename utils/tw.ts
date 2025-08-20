import { create } from 'twrnc';

// Create a single tw instance and export it as both default and named export
// so existing imports (`import tw from '@/utils/tw'` and `import { tw } from '@/utils/tw'`)
// continue to work consistently across the app.
const tw = create();

export default tw;
export { tw };


