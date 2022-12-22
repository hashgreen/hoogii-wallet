import Dexie from 'dexie'

export const cloneDatabase = async (source: string, destination: string) => {
    const databaseNames = await Dexie.getDatabaseNames()
    if (!databaseNames.includes(source)) throw new Error('source not found')
    if (databaseNames.includes(destination)) {
        throw new Error('destination existed')
    }
    const sourceDB = new Dexie(source)
    const destinationDB = new Dexie(destination)
    await sourceDB.open()
    // clone schema
    const schema = sourceDB.tables.reduce((result, table) => {
        result[table.name] = [table.schema.primKey]
            .concat(table.schema.indexes)
            .map((indexSpec) => indexSpec.src)
            .toString()
        return result
    }, {})
    destinationDB.version(sourceDB.verno).stores(schema)
    // clone data
    await sourceDB.tables.reduce(async (result, table) => {
        await result
        const rows = await table.toArray()
        destinationDB.table(table.name).bulkAdd(rows)
    }, Promise.resolve())
    sourceDB.close()
    await sourceDB.delete()
    destinationDB.close()
}

export const deleteDatabases = async () => {
    const databaseNames = await Dexie.getDatabaseNames()
    databaseNames.forEach((name) => {
        try {
            const db = new Dexie(name)
            db.delete()
        } catch (error) {}
    })
}
