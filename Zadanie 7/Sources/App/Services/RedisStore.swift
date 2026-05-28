import Foundation
import Redis
import Vapor

struct RedisEntitySnapshot: Content {
    let id: UUID
    let entity: String
    let fields: [String: String]
    let storedAt: Date
}

struct RedisAuditEvent: Content {
    let id: UUID
    let entity: String
    let entityID: UUID
    let action: String
    let createdAt: Date
}

enum RedisStore {
    static func saveCategory(_ category: Category, action: String, on req: Request) async {
        guard let id = category.id else { return }
        await save(
            entity: "category",
            id: id,
            action: action,
            fields: [
                "name": category.name,
                "description": category.description
            ],
            on: req
        )
    }

    static func saveSupplier(_ supplier: Supplier, action: String, on req: Request) async {
        guard let id = supplier.id else { return }
        await save(
            entity: "supplier",
            id: id,
            action: action,
            fields: [
                "name": supplier.name,
                "email": supplier.email,
                "phone": supplier.phone
            ],
            on: req
        )
    }

    static func saveProduct(_ product: Product, action: String, on req: Request) async {
        guard let id = product.id else { return }
        await save(
            entity: "product",
            id: id,
            action: action,
            fields: [
                "name": product.name,
                "description": product.description,
                "price": String(product.price),
                "stock": String(product.stock),
                "categoryID": product.$category.id.uuidString,
                "supplierID": product.$supplier.id.uuidString
            ],
            on: req
        )
    }

    static func delete(entity: String, id: UUID, on req: Request) async {
        do {
            _ = try await req.redis.delete([RedisKey("inventory:\(collectionName(for: entity)):\(id.uuidString)")]).get()
            try await writeEvent(entity: entity, id: id, action: "delete", on: req)
        } catch {
            req.logger.warning("Redis delete failed for \(entity) \(id): \(error.localizedDescription)")
        }
    }

    private static func save(
        entity: String,
        id: UUID,
        action: String,
        fields: [String: String],
        on req: Request
    ) async {
        let snapshot = RedisEntitySnapshot(id: id, entity: entity, fields: fields, storedAt: Date())

        do {
            try await req.redis.set(RedisKey("inventory:\(collectionName(for: entity)):\(id.uuidString)"), toJSON: snapshot)
            try await writeEvent(entity: entity, id: id, action: action, on: req)
        } catch {
            req.logger.warning("Redis save failed for \(entity) \(id): \(error.localizedDescription)")
        }
    }

    private static func writeEvent(entity: String, id: UUID, action: String, on req: Request) async throws {
        let event = RedisAuditEvent(id: UUID(), entity: entity, entityID: id, action: action, createdAt: Date())
        try await req.redis.set(RedisKey("inventory:audit:last"), toJSON: event)
        try await req.redis.set(RedisKey("inventory:audit:\(event.id.uuidString)"), toJSON: event)
        _ = try await req.redis.rpush(event.id.uuidString, into: RedisKey("inventory:audit:index")).get()
    }

    private static func collectionName(for entity: String) -> String {
        switch entity {
        case "category":
            return "categories"
        default:
            return "\(entity)s"
        }
    }
}
