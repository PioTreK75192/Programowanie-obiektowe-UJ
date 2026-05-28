import Fluent

struct CreateProduct: AsyncMigration {
    func prepare(on database: any Database) async throws {
        try await database.schema(Product.schema)
            .id()
            .field("name", .string, .required)
            .field("description", .string, .required)
            .field("price", .double, .required)
            .field("stock", .int, .required)
            .field("category_id", .uuid, .required, .references(Category.schema, "id", onDelete: .cascade))
            .field("supplier_id", .uuid, .required, .references(Supplier.schema, "id", onDelete: .cascade))
            .create()
    }

    func revert(on database: any Database) async throws {
        try await database.schema(Product.schema).delete()
    }
}
