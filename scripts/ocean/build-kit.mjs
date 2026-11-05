/**
 * Builds public/ocean/ocean-kit.glb from the Kenney Pirate Kit sources.
 *
 * Not part of `npm run build`: the output is committed, and this only needs
 * running again when the model list changes. See docs/OCEAN.md.
 *
 *   npm i --no-save @gltf-transform/core@4 @gltf-transform/extensions@4 \
 *     @gltf-transform/functions@4 meshoptimizer
 *   node scripts/ocean/build-kit.mjs <dir with the Kenney "GLB format" files>
 */
import { resolve } from 'node:path'
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import {
  dedup,
  mergeDocuments,
  meshopt,
  prune,
  quantize,
  textureCompress,
  unpartition,
  weld,
} from '@gltf-transform/functions'
import { MeshoptEncoder } from 'meshoptimizer'
import sharp from 'sharp'

const MODELS = [
  'boat-row-small',
  'palm-bend',
  'palm-straight',
  'rocks-a',
  'rocks-b',
  'rocks-sand-a',
  'grass-plant',
]

const sourceDir = process.argv[2]
if (!sourceDir) {
  console.error('usage: node scripts/ocean/build-kit.mjs <kenney-glb-dir>')
  process.exit(1)
}

await MeshoptEncoder.ready
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.encoder': MeshoptEncoder })

const kit = await io.read(resolve(sourceDir, `${MODELS[0]}.glb`))
const scene = kit.getRoot().getDefaultScene() ?? kit.getRoot().listScenes()[0]
// Every model is a root node named after its file; the scene gets a name of its
// own so a loader never has to disambiguate it from the first model.
scene.setName('ocean-kit')
scene.listChildren()[0].setName(MODELS[0])

for (const name of MODELS.slice(1)) {
  const doc = await io.read(resolve(sourceDir, `${name}.glb`))
  const roots = doc.getRoot().listScenes()[0].listChildren()
  if (roots.length !== 1) throw new Error(`${name}: expected one root node`)
  roots[0].setName(name)
  mergeDocuments(kit, doc)
}

// mergeDocuments() appends each document's scene; move their root nodes into ours.
for (const extra of kit.getRoot().listScenes().filter((s) => s !== scene)) {
  for (const node of extra.listChildren()) scene.addChild(node)
  extra.dispose()
}
kit.getRoot().setDefaultScene(scene)

await kit.transform(
  unpartition(),
  dedup(),
  prune(),
  weld(),
  textureCompress({ encoder: sharp, targetFormat: 'webp' }),
  quantize(),
  meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
)

const out = resolve(import.meta.dirname, '../../public/ocean/ocean-kit.glb')
await io.write(out, kit)
console.log(`wrote ${out}`)
