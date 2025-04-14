export interface Adapter<From, To> {
	adapt(from: From): To
}
