import React from 'react'

export type SelectorOption = {
    value: string
    label: string
    disabled?: boolean
}

export type SelectorSize = 'sm' | 'md' | 'lg'

export interface SelectorProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'size'> {
    options: ReadonlyArray<SelectorOption>
    value?: string
    defaultValue?: string
    onChange?: (value: string) => void
    placeholder?: string
    size?: SelectorSize
    fullWidth?: boolean
    error?: boolean
}

function buildSizeClasses(size: SelectorSize): string {
    if (size === 'sm') return 'h-9 px-3 pr-9 text-sm rounded-md'
    if (size === 'lg') return 'h-12 px-4 pr-10 text-base rounded-lg'
    return 'h-10 px-3.5 pr-9 text-sm rounded-lg'
}

function buildStateClasses(error: boolean | undefined): string {
    if (error === true) return 'border-red-500 focus:ring-red-500/60 focus:border-red-500 placeholder-red-300'
    return 'border-gray-700 focus:ring-blue-500/60 focus:border-blue-500 placeholder-gray-400'
}

export function Selector({
    options,
    value,
    defaultValue,
    onChange,
    placeholder,
    size = 'md',
    fullWidth = false,
    error,
    className = '',
    disabled,
    ...nativeProps
}: SelectorProps) {
    const base =
        'appearance-none bg-background-secondary text-white border outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed'
    const width = fullWidth ? 'w-full' : 'w-auto'
    const classes = [base, buildSizeClasses(size), buildStateClasses(error), width, className].filter(Boolean).join(' ')

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        onChange?.(event.target.value)
    }

    return (
        <div className={`${fullWidth ? 'w-full' : 'inline-block'} relative`}>
            <select
                className={classes}
                value={value}
                defaultValue={defaultValue}
                onChange={handleChange}
                disabled={disabled}
                {...nativeProps}
            >
                {placeholder ? (
                    <option
                        value=""
                        disabled
                        hidden
                    >
                        {placeholder}
                    </option>
                ) : null}
                {options.map(option => (
                    <option
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                    >
                        {option.label}
                    </option>
                ))}
            </select>
            <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300"
            >
                <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                />
            </svg>
        </div>
    )
}
