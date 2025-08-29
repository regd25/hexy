export interface SystemResult<TValue, TError extends Error = Error> {
    ok: boolean
    value?: TValue
    error?: TError
}

export const ok = <TValue, TError extends Error = Error>(value: TValue): SystemResult<TValue, TError> => {
    return {
        ok: true,
        value,
    }
}

export const err = <TError extends Error>(error: TError): SystemResult<never, TError> => {
    return {
        ok: false,
        error,
    }
}

export const isOk = <TValue, TError extends Error>(
    result: SystemResult<TValue, TError>
): result is SystemResult<TValue, TError> => {
    return result.ok
}

export const map = <TValue, TNewValue, TError extends Error>(
    result: SystemResult<TValue, TError>,
    mapper: (value: TValue) => TNewValue
): SystemResult<TNewValue, TError> => {
    if (!result.value) throw new Error('Result has no value')
    return {
        ok: true,
        value: mapper(result.value),
    }
}

export const mapError = <TValue, TError extends Error, TNewError extends Error>(
    result: SystemResult<TValue, TError>,
    mapper: (error: TError) => TNewError
): SystemResult<TValue, TNewError> => {
    if (!result.error) return err(new Error('Result has no error') as TNewError)
    return {
        ok: false,
        error: mapper(result.error),
    }
}

export const unwrapOrThrow = <TValue, TError extends Error>(result: SystemResult<TValue, TError>): TValue => {
    if (result.ok) return result.value as TValue
    throw result.error
}
