import {
	Criteria,
	Filter,
	FilterField,
	FilterOperator,
	Filters,
	FilterValue,
	Order,
	OrderBy,
	OrderType,
	OrderTypes,
} from '@/domain'

describe('Criteria', () => {
	describe('Filter', () => {
		it('should create a filter with field, operator and value', () => {
			const field = new FilterField('name')
			const operator = FilterOperator.equal()
			const value = new FilterValue('John')

			const filter = new Filter(field, operator, value)

			expect(filter.toPrimitives().field).toBe('name')
			expect(filter.toPrimitives().operator).toBe('=')
			expect(filter.toPrimitives().value).toBe('John')
		})

		it('should create a filter from primitives', () => {
			const filter = Filter.fromPrimitives({
				field: 'name',
				operator: '=',
				value: 'John',
			})

			expect(filter.toPrimitives().field).toBe('name')
			expect(filter.toPrimitives().operator).toBe('=')
			expect(filter.toPrimitives().value).toBe('John')
		})
	})

	describe('Filters', () => {
		it('should create empty filters', () => {
			const filters = Filters.none()

			expect(filters.toPrimitives()).toHaveLength(0)
		})

		it('should create filters from an array of filters', () => {
			const filter1 = Filter.fromPrimitives({
				field: 'name',
				operator: '=',
				value: 'John',
			})

			const filter2 = Filter.fromPrimitives({
				field: 'age',
				operator: '>',
				value: '18',
			})

			const filters = new Filters([filter1, filter2])

			expect(filters.toPrimitives()).toHaveLength(2)
			expect(filters.toPrimitives()[0]).toBe(filter1.toPrimitives())
			expect(filters.toPrimitives()[1]).toBe(filter2.toPrimitives())
		})

		it('should create filters from primitives', () => {
			const filters = Filters.fromPrimitives([
				{ field: 'name', operator: '=', value: 'John' },
				{ field: 'age', operator: '>', value: '18' },
			])

			expect(filters.toPrimitives()).toHaveLength(2)
			expect(filters.toPrimitives()[0].field).toBe('name')
			expect(filters.toPrimitives()[0].operator).toBe('=')
			expect(filters.toPrimitives()[0].value).toBe('John')
			expect(filters.toPrimitives()[1].field).toBe('age')
			expect(filters.toPrimitives()[1].operator).toBe('>')
			expect(filters.toPrimitives()[1].value).toBe('18')
		})
	})

	describe('Order', () => {
		it('should create an order with orderBy and orderType', () => {
			const orderBy = new OrderBy('name')
			const orderType = new OrderType(OrderTypes.ASC)

			const order = new Order(orderBy, orderType)

			expect(order.toPrimitives().orderBy).toBe('name')
			expect(order.toPrimitives().orderType).toBe('asc')
		})

		it('should create an order from primitives', () => {
			const order = Order.fromPrimitives({ orderBy: 'name', orderType: 'asc' })

			expect(order.toPrimitives().orderBy).toBe('name')
			expect(order.toPrimitives().orderType).toBe('asc')
		})

		it('should create a none order', () => {
			const order = Order.none()

			expect(order.toPrimitives().orderBy).toBe('')
			expect(order.toPrimitives().orderType).toBe('asc')
		})
	})

	describe('Criteria', () => {
		it('should create a criteria with filters and order', () => {
			const filters = Filters.fromPrimitives([
				{ field: 'name', operator: '=', value: 'John' },
			])

			const order = Order.fromPrimitives({ orderBy: 'name', orderType: 'asc' })

			const criteria = new Criteria(filters, order)

			expect(criteria.toPrimitives().filters).toBe(filters.toPrimitives())
			expect(criteria.toPrimitives().orderBy).toBe(order.toPrimitives().orderBy)
			expect(criteria.toPrimitives().orderType).toBe(
				order.toPrimitives().orderType,
			)
		})

		it('should create a criteria with no filters and no order', () => {
			const criteria = Criteria.none()

			expect(criteria.toPrimitives().filters).toHaveLength(0)
			expect(criteria.toPrimitives().orderBy).toBe('')
			expect(criteria.toPrimitives().orderType).toBe('asc')
		})

		it('should create a criteria from primitives', () => {
			const criteria = Criteria.fromPrimitives(
				[{ field: 'name', operator: '=', value: 'John' }],
				'name',
				'asc',
			)

			expect(criteria.toPrimitives().filters).toHaveLength(1)
			expect(criteria.toPrimitives().filters[0].field).toBe('name')
			expect(criteria.toPrimitives().orderBy).toBe('name')
			expect(criteria.toPrimitives().orderType).toBe('asc')
		})
	})
})
