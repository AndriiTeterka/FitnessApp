import { create } from 'twrnc';

// Create a single tw instance wired to Tailwind config so custom theme is available
// Export as both default and named export to support existing imports
const tw = create(require('../tailwind.config.js'));

export default tw;
export { tw };


