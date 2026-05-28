import Fluent

struct CreateCategory: AsyncMigration {
    func prepare(on database: any Database) async throws {
        try await database.schema(Category.schema)
            .id()
            .field("name", .string, .required)
            .field("description", .string, .required)
            .unique(on: "name")
            .create()
    }

    func revert(on database: any Database) async throws {
        try await database.schema(Category.schema).delete()
    }
}
