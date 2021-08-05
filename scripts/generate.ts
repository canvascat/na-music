import fs from 'fs'
import path from 'path'
// @ts-ignore
import { optimize } from 'svgo'
import { camelize } from '@vue/shared'

const config = {
  plugins: [
    'cleanupAttrs',
    'removeDoctype',
    'removeXMLProcInst',
    'removeComments',
    'removeMetadata',
    'removeTitle',
    'removeDesc',
    'removeUselessDefs',
    'removeEditorsNSData',
    'removeEmptyAttrs',
    'removeHiddenElems',
    'removeEmptyText',
    'removeEmptyContainers',
    // 'removeViewBox',
    'cleanupEnableBackground',
    'convertStyleToAttrs',
    'convertColors',
    'convertPathData',
    'convertTransform',
    'removeUnknownsAndDefaults',
    'removeNonInheritableGroupAttrs',
    'removeUselessStrokeAndFill',
    'removeUnusedNS',
    'cleanupIDs',
    'cleanupNumericValues',
    'moveElemsAttrsToGroup',
    'moveGroupAttrsToElems',
    'collapseGroups',
    // 'removeRasterImages',
    'mergePaths',
    'convertShapeToPath',
    'sortAttrs',
    'removeDimensions',
    { name: 'removeAttrs', params: { attrs: '(stroke|fill|class)' } },
    {
      name: 'addAttrs',
      type: 'perItem',
      fn (ast: any) {
        const { type, name } = ast
        if (type === 'svg') ast.attributes.class = 'svg-icon'
        if (type === 'element' && name === 'path') {
          ast.attributes.stroke = 'currentColor'
          ast.attributes.fill = 'currentColor'
        }
      }
    }
  ]
}

// maybe consider using gulp here to do sequential operations
// without implementation chaining function
function main (ROOT: string, outDir: string) {
  const icons = fs.readdirSync(ROOT)

  return Promise.all(icons.map(icon => transform(icon, ROOT, outDir)))
}

async function transform (filename: string, ROOT: string, outDir: string) {
  console.log(`Start building: ${filename}`)

  const content = await fs.promises.readFile(path.resolve(ROOT, filename), { encoding: 'utf-8' })

  const basename = filename.split('.svg').shift()
  const componentName = camelize('-' + basename)

  const optimized = optimize(content, config)

  const transformed = transformToVue3(optimized.data, componentName)
  await writeToDisk(outDir, transformed, componentName)
  return componentName
}

async function writeToDisk (outDir: string, content: string, componentName: string, extension = 'vue') {
  const targetFile = path.resolve(outDir, `./${componentName}.${extension}`)
  await fs.promises.writeFile(targetFile, content, { encoding: 'utf-8' })
}

function transformToVue3 (content: string, componentName: string) {
  // this is a rather arbitrary
  const index = content.indexOf('<svg ') + 5
  content = content.slice(0, index) + 'class="svg-icon" ' + content.slice(index)
  return `
<template>
  ${content}
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Icon${componentName}'
})
</script>
`.trimStart()
}

export async function generateIcons (root: string, out: string) {
  const names = await main(root, out)
  const index = names.map(componentName => `export { default as Icon${componentName} } from './${componentName}.vue'`).join('\n') + '\n'
  await writeToDisk(out, index, 'index', 'ts')
  console.log('generate icons finished')
}
