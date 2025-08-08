import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
    entries: ['src/index', 'src/types/index', 'src/errors/index', 'src/generator/index'],
    declaration: true,
    clean: true,
    rollup: {
        emitCJS: true,
        dts: {
            respectExternal: true,
        },
    },
})
