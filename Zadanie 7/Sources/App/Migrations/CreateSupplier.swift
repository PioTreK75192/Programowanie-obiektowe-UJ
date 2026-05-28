import Fluent

struct CreateSupplier: AsyncMigration {
    func prepare(on database: any Database) async throws {
        try await database.schema(Supplier.schema)
            .id()
            .field("name", .string, .required)
            .field("email", .string, .required)
            .field("phone", .string, .required)
            .unique(on: "email")
            .create()
    }

    func revert(on database: any Database) async throws {
        try await database.schema(Supplier.schema).delete()
    }
}
