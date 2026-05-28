import Fluent
import Vapor

struct SupplierController: RouteCollection {
    func boot(routes: any RoutesBuilder) throws {
        let suppliers = routes.grouped("suppliers")
        suppliers.get(use: index)
        suppliers.get("new", use: create)
        suppliers.post(use: store)
        suppliers.get(":supplierID", "edit", use: edit)
        suppliers.post(":supplierID", use: update)
        suppliers.post(":supplierID", "delete", use: delete)
    }

    func index(req: Request) async throws -> View {
        let suppliers = try await Supplier.query(on: req.db)
            .sort(\.$name)
            .all()

        var items: [SupplierListItem] = []
        for supplier in suppliers {
            let productsCount = try await supplier.$products.query(on: req.db).count()
            items.append(
                SupplierListItem(
                    id: try supplier.requireID().uuidString,
                    name: supplier.name,
                    email: supplier.email,
                    phone: supplier.phone,
                    productsCount: productsCount
                )
            )
        }

        return try await req.view.render("suppliers/index", SupplierIndexContext(suppliers: items)).get()
    }

    func create(req: Request) async throws -> View {
        try await req.view.render("suppliers/form", SupplierFormContext(
            title: "Nowy dostawca",
            action: "/suppliers",
            submitLabel: "Dodaj dostawce",
            supplier: SupplierFormData(name: "", email: "", phone: "")
        )).get()
    }

    func store(req: Request) async throws -> Response {
        let form = try req.content.decode(SupplierFormInput.self)
        let supplier = Supplier(name: form.name, email: form.email, phone: form.phone)
        try await supplier.save(on: req.db)
        await RedisStore.saveSupplier(supplier, action: "create", on: req)
        return req.redirect(to: "/suppliers")
    }

    func edit(req: Request) async throws -> View {
        let supplier = try await findSupplier(req)
        return try await req.view.render("suppliers/form", SupplierFormContext(
            title: "Edycja dostawcy",
            action: "/suppliers/\(try supplier.requireID().uuidString)",
            submitLabel: "Zapisz zmiany",
            supplier: SupplierFormData(name: supplier.name, email: supplier.email, phone: supplier.phone)
        )).get()
    }

    func update(req: Request) async throws -> Response {
        let supplier = try await findSupplier(req)
        let form = try req.content.decode(SupplierFormInput.self)
        supplier.name = form.name
        supplier.email = form.email
        supplier.phone = form.phone
        try await supplier.update(on: req.db)
        await RedisStore.saveSupplier(supplier, action: "update", on: req)
        return req.redirect(to: "/suppliers")
    }

    func delete(req: Request) async throws -> Response {
        let supplier = try await findSupplier(req)
        let id = try supplier.requireID()
        try await supplier.delete(on: req.db)
        await RedisStore.delete(entity: "supplier", id: id, on: req)
        return req.redirect(to: "/suppliers")
    }

    private func findSupplier(_ req: Request) async throws -> Supplier {
        guard
            let id = req.parameters.get("supplierID", as: UUID.self),
            let supplier = try await Supplier.find(id, on: req.db)
        else {
            throw Abort(.notFound)
        }
        return supplier
    }
}

struct SupplierFormInput: Content {
    let name: String
    let email: String
    let phone: String
}

struct SupplierIndexContext: Content {
    let suppliers: [SupplierListItem]
}

struct SupplierListItem: Content {
    let id: String
    let name: String
    let email: String
    let phone: String
    let productsCount: Int
}

struct SupplierFormContext: Content {
    let title: String
    let action: String
    let submitLabel: String
    let supplier: SupplierFormData
}

struct SupplierFormData: Content {
    let name: String
    let email: String
    let phone: String
}
