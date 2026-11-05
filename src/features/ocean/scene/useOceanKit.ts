import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import type { Object3D } from 'three'
import { ASSETS } from '../config'

export type KitModel =
  | 'boat-row-small'
  | 'palm-bend'
  | 'palm-straight'
  | 'rocks-a'
  | 'rocks-b'
  | 'rocks-sand-a'
  | 'grass-plant'

const extend = (loader: GLTFLoader) => {
  loader.setMeshoptDecoder(MeshoptDecoder)
}

/**
 * The whole kit is one meshopt-compressed GLB (see docs/OCEAN.md), so a single
 * request brings every model. Returns the root node of each model by name.
 */
export function useOceanKit(): Record<KitModel, Object3D> {
  const gltf: GLTF = useLoader(GLTFLoader, ASSETS.kit, extend)
  // Look only at root nodes: the merged scene itself inherited the first
  // model's name, so a recursive search would return the whole kit.
  const find = (name: KitModel): Object3D => {
    const node = gltf.scene.children.find((child) => child.name === name)
    if (!node) throw new Error(`ocean-kit.glb is missing "${name}"`)
    return node
  }
  return {
    'boat-row-small': find('boat-row-small'),
    'palm-bend': find('palm-bend'),
    'palm-straight': find('palm-straight'),
    'rocks-a': find('rocks-a'),
    'rocks-b': find('rocks-b'),
    'rocks-sand-a': find('rocks-sand-a'),
    'grass-plant': find('grass-plant'),
  }
}

/** Deep clone with shadows switched on; materials and geometry stay shared. */
export function cloneWithShadows(source: Object3D, cast: boolean, receive: boolean): Object3D {
  const copy = source.clone(true)
  copy.position.set(0, 0, 0)
  copy.rotation.set(0, 0, 0)
  copy.scale.set(1, 1, 1)
  copy.traverse((child) => {
    child.castShadow = cast
    child.receiveShadow = receive
  })
  return copy
}
