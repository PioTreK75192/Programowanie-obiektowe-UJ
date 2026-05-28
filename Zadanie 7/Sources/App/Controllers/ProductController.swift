import Fluent
import Foundation
import Vapor

struct ProductController: RouteCollection {
    func boot(routes: any RoutesBuilder) throws {
        let products = routes.grouped("products")
        products.get(use: index)
        products.get("new", use: create)
        products.post(use: store)
        products.get(":productID", "edit", use: edit)
        products.post(":productID", use: update)
        products.post(":productID", "delete", use: delete)
    }

    func index(req: Request) async throws -> View {
        let products = try await Product.query(on: req.db)
            .with(\.$category)
            .with(\.$supplier)
            .sort(\.$name)
            .all()

        let items = try products.map { product in
            ProductListItem(
                id: try product.requireID().uuidString,
                name: product.name,
                description: product.description,
                price: String(format: "%.2f", product.price),
                stock: product.stock,
                categoryName: product.category.name,
                supplierName: product.supplier.name
            )
        }

        return try await req.view.render("products/index", ProductIndexContext(products: items)).get()
    }

    func create(req: Request) async throws -> View {
        try await renderForm(
            req,
            title: "Nowy produkt",
            action: "/products",
            submitLabel: "Dodaj produkt",
            product: ProductFormData(
                name: "",
                description: "",
                price: "0.00",
                stock: 0,
                categoryID: "",
                supplierID: ""
            )
        )
    }

    func store(req: Request) async throws -> Response {
        let form = try req.content.decode(ProductFormInput.self)
        let product = Product(
            name: form.name,
            description: form.description,
            price: form.price,
            stock: form.stock,
            categoryID: form.categoryID,
            supplierID: form.supplierID
        )
        try await product.save(on: req.db)
        await RedisStore.saveProduct(product, action: "create", on: req)
        return req.redirect(to: "/products")
    }

    func edit(req: Request) async throws -> View {
        let product = try await findProduct(req)
        return try await renderForm(
            req,
            title: "Edycja produktu",
            action: "/products/\(try product.requireID().uuidString)",
            submitLabel: "Zapisz zmiany",
            product: ProductFormData(
                name: product.name,
                description: product.description,
                price: String(format: "%.2f", product.price),
                stock: product.stock,
                categoryID: product.$category.id.uuidString,
                supplierID: product.$supplier.id.uuidString
            )
        )
    }

    func update(req: Request) async throws -> Response {
        let product = try await findProduct(req)
        let form = try req.content.decode(ProductFormInput.self)
        product.name = form.name
        product.description = form.description
        product.price = form.price
        product.stock = form.stock
        product.$category.id = form.categoryID
        product.$supplier.id = form.supplierID
        try await product.update(on: req.db)
        await RedisStore.saveProduct(product, action: "update", on: req)
        return req.redirect(to: "/products")
    }

    func delete(req: Request) async throws -> Response {
        let product = try await findProduct(req)
        let id = try product.requireID()
        try await product.delete(on: req.db)
        await RedisStore.delete(entity: "product", id: id, on: req)
        return req.redirect(to: "/products")
    }

    private func renderForm(
        _ req: Request,
        title: String,
        action: String,
        submitLabel: String,
        product: ProductFormData
    ) async throws -> View {
        let categories = try await Category.query(on: req.db).sort(\.$name).all()
        let suppliers = try await Supplier.query(on: req.db).sort(\.$name).all()

        let context = ProductFormContext(
            title: title,
            action: action,
            submitLabel: submitLabel,
            product: product,
            categories: try categories.map {
                SelectionItem(
                    id: try $0.requireID().uuidString,
                    name: $0.name,
                    selected: (try $0.requireID().uuidString == product.categoryID) ? "selected" : ""
                )
            },
            suppliers: try suppliers.map {
                SelectionItem(
                    id: try $0.requireID().uuidString,
                    name: $0.name,
                    selected: (try $0.requireID().uuidString == product.supplierID) ? "selected" : ""
                )
            }
        )

        return try await req.view.render("products/form", context).get()
    }

    private func findProduct(_ req: Request) async throws -> Product {
        guard
            let id = req.parameters.get("productID", as: UUID.self),
            let product = try await Product.find(id, on: req.db)
        else {
            throw Abort(.notFound)
        }
        return product
    }
}

struct ProductFormInput: Content {
    let name: String
    let description: String
    let price: Double
    let stock: Int
    let categoryID: UUID
    let supplierID: UUID
}

struct ProductIndexContext: Content {
    let products: [ProductListItem]
}

struct ProductListItem: Content {
    let id: String
    let name: String
    let description: String
    let price: String
    let stock: Int
    let categoryName: String
    let supplierName: String
}

struct ProductFormContext: Content {
    let title: String
    let action: String
    let submitLabel: String
    let product: ProductFormData
    let categories: [SelectionItem]
    let suppliers: [SelectionItem]
}

struct ProductFormData: Content {
    let name: String
    let description: String
    let price: String
    let stock: Int
    let categoryID: String
    let supplierID: String
}

struct SelectionItem: Content {
    let id: String
    let name: String
    let selected: String
}
