/* DAWN v2 — loading manager with real progress. */
import { LoadingManager } from 'three';
import { GLTFLoader } from 'three/addons/loaders/gltfloader.js';
import { setState } from './store.js';

export function createLoader(onProgress) {
  const manager = new LoadingManager();
  manager.onProgress = (url, loaded, total) => {
    const pct = total > 0 ? loaded / total : 0;
    onProgress?.(pct, `Loading ${url.split('/').pop()}`);
    setState({ bootProgress: pct, bootStatus: `Loading ${url.split('/').pop()}` });
  };
  manager.onError = (url) => {
    console.warn('DAWN asset failed:', url);
  };
  return { manager, gltf: new GLTFLoader(manager) };
}
