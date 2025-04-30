// typings/libsvm-js-asm.d.ts
/**
 * Provide a minimal typing for the asm.js build of libsvm-js.
 * We import the main SVM class from the canonical module.
 */
declare module 'libsvm-js/asm' {
    import { SVM as BaseSVM, KERNEL_TYPES, SVM_TYPES } from 'libsvm-js';
    // Export the same SVM class and constants
    export default BaseSVM;
    export { KERNEL_TYPES, SVM_TYPES };
}
