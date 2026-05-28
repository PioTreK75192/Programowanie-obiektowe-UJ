import Vapor

func routes(_ app: Application) throws {
    app.get { req async throws -> View in
        try await req.view.render("home").get()
    }

    try app.register(collection: CategoryController())
    try app.register(collection: SupplierController())
    try app.register(collection: ProductController())
}
