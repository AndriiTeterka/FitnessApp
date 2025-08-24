import { create } from 'twrnc';
import tailwindConfig from '../tailwind.config';

// Create a single tw instance wired to Tailwind config so custom theme is available
// Export as both default and named export to support existing imports
const tw = create(tailwindConfig as any);

export default tw;
export { tw };


