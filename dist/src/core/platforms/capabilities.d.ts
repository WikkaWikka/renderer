/**
 * Runtime feature checks, evaluated once at module load.
 *
 * @remarks
 * Guard `instanceof` against globals that may be missing (older browsers,
 * workers, Node) with these instead of repeating `typeof X !== 'undefined'`.
 */
export declare const hasImageBitmap: boolean;
