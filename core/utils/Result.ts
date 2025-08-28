export type Result<TValue, TError extends Error = Error> = { ok: true; value: TValue } | { ok: false; error: TError }

export function ok<TValue, TError extends Error = Error>(value: TValue): Result<TValue, TError> {
    return { ok: true, value }
}

export function err<TError extends Error>(error: TError): Result<never, TError> {
    return { ok: false, error }
}

export function isOk<TValue, TError extends Error>(
    result: Result<TValue, TError>
): result is { ok: true; value: TValue } {
    return result.ok
}

export function map<TValue, TNewValue, TError extends Error>(
    result: Result<TValue, TError>,
    mapper: (value: TValue) => TNewValue
): Result<TNewValue, TError> {
    return result.ok ? ok(mapper(result.value)) : result
}

export function mapError<TValue, TError extends Error, TNewError extends Error>(
    result: Result<TValue, TError>,
    mapper: (error: TError) => TNewError
): Result<TValue, TNewError> {
    return result.ok ? result : err(mapper(result.error))
}

export function unwrapOrThrow<TValue, TError extends Error>(result: Result<TValue, TError>): TValue {
    if (result.ok) return result.value
    throw result.error
}
