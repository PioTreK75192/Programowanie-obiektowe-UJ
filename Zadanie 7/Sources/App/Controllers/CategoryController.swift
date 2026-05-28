import Fluent
import Vapor

struct CategoryController: RouteCollection {
    func boot(routes: any RoutesBuilder) throws {
        let categories = routes.grouped("categories")
        categories.get(use: index)
        categories.get("new", use: create)
        categories.post(use: store)
        categories.get(":categoryID", "edit", use: edit)
        categories.post(":categoryID", use: update)
        categories.post(":categoryID", "delete", use: delete)
    }

    func index(req: Request) async throws -> View {
        let categories = try await Category.query(on: req.db)
            .sort(\.$name)
            .all()

        var items: [CategoryListItem] = []
        for category in categories {
            let productsCount = try await category.$products.query(on: req.db).count()
            items.append(
                CategoryListItem(
                    id: try category.requireID().uuidString,
                    name: category.name,
                    description: category.description,
                    productsCount: productsCount
                )
            )
        }

        return try await req.view.render("categories/index", CategoryIndexContext(categories: items)).get()
    }

    func create(req: Request) async throws -> View {
        try await req.view.render("categories/form", CategoryFormContext(
            title: "Nowa kategoria",
            action: "/categories",
            submitLabel: "Dodaj kategorie",
            category: CategoryFormData(name: "", description: "")
        )).get()
    }

    func store(req: Request) async throws -> Response {
        let form = try req.content.decode(CategoryFormInput.self)
        let category = Category(name: form.name, description: form.description)
        try await category.save(on: req.db)
        await RedisStore.saveCategory(category, action: "create", on: req)
        return req.redirect(to: "/categories")
    }

    func edit(req: Request) async throws -> View {
        let category = try await findCategory(req)
        return try await req.view.render("categories/form", CategoryFormContext(
            title: "Edycja kategorii",
            action: "/categories/\(try category.requireID().uuidString)",
            submitLabel: "Zapisz zmiany",
            category: CategoryFormData(name: category.name, description: category.description)
        )).get()
    }

    func update(req: Request) async throws -> Response {
        let category = try await findCategory(req)
        let form = try req.content.decode(CategoryFormInput.self)
        category.name = form.name
        category.description = form.description
        try await category.update(on: req.db)
        await RedisStore.saveCategory(category, action: "update", on: req)
        return req.redirect(to: "/categories")
    }

    func delete(req: Request) async throws -> Response {
        let category = try await findCategory(req)
        let id = try category.requireID()
        try await category.delete(on: req.db)
        await RedisStore.delete(entity: "category", id: id, on: req)
        return req.redirect(to: "/categories")
    }

    private func findCategory(_ req: Request) async throws -> Category {
        guard
            let id = req.parameters.get("categoryID", as: UUID.self),
            let category = try await Category.find(id, on: req.db)
        else {
            throw Abort(.notFound)
        }
        return category
    }
}

struct CategoryFormInput: Content {
    let name: String
    let description: String
}

struct CategoryIndexContext: Content {
    let categories: [CategoryListItem]
}

struct CategoryListItem: Content {
    let id: String
    let name: String
    let description: String
    let productsCount: Int
}

struct CategoryFormContext: Content {
    let title: String
    let action: String
    let submitLabel: String
    let category: CategoryFormData
}

struct CategoryFormData: Content {
    let name: String
    let description: String
}
