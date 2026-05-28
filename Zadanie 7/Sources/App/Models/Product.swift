import Fluent
import Vapor

final class Product: Model, Content, @unchecked Sendable {
    static let schema = "products"

    @ID(key: .id)
    var id: UUID?

    @Field(key: "name")
    var name: String

    @Field(key: "description")
    var description: String

    @Field(key: "price")
    var price: Double

    @Field(key: "stock")
    var stock: Int

    @Parent(key: "category_id")
    var category: Category

    @Parent(key: "supplier_id")
    var supplier: Supplier

    init() {}

    init(
        id: UUID? = nil,
        name: String,
        description: String,
        price: Double,
        stock: Int,
        categoryID: UUID,
        supplierID: UUID
    ) {
        self.id = id
        self.name = name
        self.description = description
        self.price = price
        self.stock = stock
        self.$category.id = categoryID
        self.$supplier.id = supplierID
    }
}
