export interface Mapper<From, To> {
	from(from: From): To
	to(to: To): From
}
