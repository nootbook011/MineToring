import { BedrockEntity } from "#Base/BedrockWorld/bedrockObjects/BaseBedrockEntity"

export default class entityParser {
    static metadata(p = {}) {
        return {
            type: p.entity_type || 'minecraft:zombie',
            id: {
                unique: p.unique_id || BigInt(0),
                runtime: p.runtime_id || BigInt(0)
            }
        }
    }

    static data(p = {}) {
        return {}
    }

    static attributes(p = {}) {
        const { attributes = [] } = p
        return attributes.map(({ name, ...data }) => [name, data])
    }

    static buildEntity(p, bedrockMap) {
        const { runtime_id } = p

        const metadata = entityParser.metadata(p)
        const data = entityParser.data(p)
        const attributes = entityParser.attributes(p)

        let BEntity = bedrockMap.getEntity(runtime_id)
        if (!BEntity) {
            BEntity = new BedrockEntity(metadata, data, attributes)
            bedrockMap.setEntity(BEntity, runtime_id)
        } else {
            BEntity.setMetadata(metadata)
            BEntity.setData(data)
        }

        return BEntity
    }
}